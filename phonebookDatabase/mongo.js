const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

if (process.argv.length < 3) {
  console.log(
    "Please provide the password as an argument: node mongo.js <password>");
  process.exit(1);
}

const passwd = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://usman7384:${passwd}@cluster0.wxvsji5.mongodb.net/PhoneBook?retryWrites=true&w=majority`;

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (process.argv.length === 3) {
  Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log(person.name + " " + person.number);
      mongoose.connection.close();
    });
  });
}

if (process.argv.length > 3) {
  const person = new Person({
    name: name,
    number: number,
  });
  person.save().then((result) => {
    console.log(`added ${name} number ${number} to phonebook`);
    mongoose.connection.close();
  });
}

export default Person;
