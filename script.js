const commandInput = document.getElementById("command");
const output = document.getElementById("output");

commandInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault(); // Prevent newline
    const command = commandInput.value.trim();

    if (command !== "") {
      if (command.toLowerCase() === "clear") {
        output.innerHTML = ""; // Clear the console
      } else {
        output.innerHTML += `$ ${command}\n`;
      }
    }

    commandInput.value = "";
    window.scrollTo(0, document.body.scrollHeight);
  }
});
