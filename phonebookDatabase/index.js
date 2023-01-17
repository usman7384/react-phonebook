require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const cors = require("cors");
const Person = require("./models/person");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static("build"));

morgan.token("ob", function(req, res) {
  console.log("ob", req.body);
  return `${JSON.stringify(req.body)}`;
});

app.use(morgan(":method :url :status :response-time :req[header] :ob"));

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === "CastError") {
    return response.status(400).send({ error: "malformatted id" });
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: "Validation Failed" });
  }

  next(error);
};

app.use(errorHandler);

app.get("/api/persons", (request, response) => {
  Person.find({}).then((result) => {
    response.json(result);
  });
});

app.get("/info", (request, response) => {
  const timestamp = new Date(Date.now());
  const countInfo = Person.find();
  countInfo.count(function(err, count) {
    if (err) console.log(err);
    else {
      response.send(
        `<p> Phonebook has info for ${count}
         people </p> <p> ${timestamp.toUTCString()}</p>`,
      );
    }
  });
});

app.get("/api/persons/:id", (request, response, next) => {
  const id = request.params.id;
  Person.findById(id)
    .then((person) => {
      if (person) {
        response.json(person);
        response.status(200).end();
      } else {
        response.status(404).end();
      }
    })
    .catch((error) => next(error));
});

app.delete("/api/persons/:id", (request, response) => {
  const id = request.params.id;
  Person.findByIdAndRemove(id).then((result) => {
    response.status(204).end();
  });
});

app.post("/api/persons", (request, response, next) => {
  const body = request.body;

  if (!body.name) {
    return response.status(400).json({
      error: "Name Is Missing",
    });
  }

  if (!body.number) {
    return response.status(400).json({
      error: "Number Is Missing",
    });
  }
  Person.find({}).then((persons) => {
    if (persons.some((person) => person.name === body.name)) {
      return response.status(400).json({
        error: "Name Must Be Unique",
      });
    }

    const person = new Person({
      name: body.name,
      number: body.number,
    });

    person
      .save()
      .then((newPerson) => {
        response.json(newPerson);
      })
      .catch((error) => next(error));
  });
});

app.put("/api/persons/:id", (request, response, next) => {
  const body = request.body;
  const person = {
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
