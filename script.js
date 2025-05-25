<script>
  const commandInput = document.getElementById("command");
  const output = document.getElementById("output");

  const commands = {
    clear: {
      description: "Clears the terminal",
      action: () => {
        output.innerHTML = "";
      }
    },
    cmd: {
      description: "Lists all available commands",
      action: () => {
        let helpText = "Available commands:\n";
        for (const cmd in commands) {
          helpText += `- ${cmd}: ${commands[cmd].description}\n`;
        }
        printOutput(helpText.trim());
      }
    }
  };

  function printOutput(text) {
    const lines = text.split("\n");
    lines.forEach(line => {
      output.innerHTML += `<div>${line}</div>`;
    });
  }

  commandInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
      event.preventDefault();
      const command = commandInput.value.trim();
      output.innerHTML += `<div>$ ${command}</div>`;
      
      const baseCommand = command.split(" ")[0];

      if (commands[baseCommand]) {
        commands[baseCommand].action(command);
      } else if (command !== "") {
        printOutput(`Unknown command: ${baseCommand}`);
      }

      commandInput.value = "";
      output.parentElement.scrollTop = output.parentElement.scrollHeight;
    }
  });
</script>
