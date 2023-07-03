const fetch = require("node-fetch");

module.exports = async (data, {to='fa'})=>{
const response = await fetch("http://127.0.0.1:5000/translate", {
	method: "POST",
	body: JSON.stringify({
    q: data,
    source: "en",
    target: to
	}),
	headers: { "Content-Type": "application/json" }
});
const {translatedText: text} = await response.json()
return {text}
}