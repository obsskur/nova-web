const commandInput = document.getElementById("command");
const output = document.getElementById("output");

commandInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    const command = commandInput.value;
    if (command !== "") {
      output.innerHTML += `$ ${command}\n`;
    }
    commandInput.value = "";
    window.scrollTo(0, document.body.scrollHeight);
  }
});
