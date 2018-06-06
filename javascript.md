For my JavaScript best practices, I adhered to a generic set of best practices that W3schools use.

The Best practices I use are as follows:

•	Identifier names are written in camelCase.

•	All names start with a letter.
o	An example of this is:
firstName = “John”;
	lastName = “Doe”;

•	Always have spaces around operators.
o	An example of this is:
var x = y + z;
var values = [“Volvo, “Saab”, “Fiat”];

Code Indentation of 5 spaces is used in code blocks. (Tabs shouldn’t be used for indentation because of how different editors interpret tabs. – This was not followed however.)
o	An example of this is:
function toCelsius(fahrenheit) {
    return (5 / 9) * (fahrenheit - 32);
}

•	Simple statements are always ended with a semicolon.
o	An example as follows:
var values = [“Volvo”, “Saab”, “Fiat”];

var person = {
    firstName: "John",
    lastName: "Doe",
    age: 50,
    eyeColor: "blue"
};