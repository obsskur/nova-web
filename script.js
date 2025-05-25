const commandInput = document.getElementById("command");
const output = document.getElementById("output");

commandInput.addEventListener("keydown", function (event) {
  // Submit when pressing Ctrl+Enter
  if (event.key === "Enter" && event.ctrlKey) {
    event.preventDefault();
    const command = commandInput.value.trim();
    if (command !== "") {
      output.innerHTML += `$ ${command}\n`;
    }
    commandInput.value = "";
    autoResize();
    window.scrollTo(0, document.body.scrollHeight);
  } else {
    autoResize();
  }
});

function autoResize() {
  commandInput.style.height = "auto";
  commandInput.style.height = commandInput.scrollHeight + "px";
}
