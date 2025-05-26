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
  },
  var: {
    description: "Scans for and decrypts a file. Usage: var <filename>",
    action: (fullCommand) => {
      const parts = fullCommand.split(" ");
      if (parts.length < 2) {
        printOutput("Usage: var <filename>");
        return;
      }
      const fileName = parts.slice(1).join(" "); // support spaces in filename
      simulateFakeScan(fileName);
    }
  }
};

function printOutput(text) {
  const lines = text.split("\n");
  lines.forEach(line => {
    const div = document.createElement("div");
    div.textContent = line;
    output.appendChild(div);
  });
}

function simulateFakeScan(fileName) {
  const steps = [
    `Scanning local network for "${fileName}"...`,
    `Found "${fileName}" on nearby device.`,
    `Decrypting "${fileName}"...`,
    `"${fileName}" decrypted successfully.`,
    `Saving "${fileName}" to local storage...`,
    `"${fileName}" saved!`
  ];

  let i = 0;
  const interval = setInterval(() => {
    if (i < steps.length) {
      printOutput(steps[i]);
      i++;
    } else {
      clearInterval(interval);
    }
  }, 800); // 800ms delay per step
}

commandInput.addEventListener("keydown", function(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    const command = commandInput.value.trim();

    if (command !== "") {
      const cmdLine = document.createElement("div");
      cmdLine.textContent = `$ ${command}`;
      output.appendChild(cmdLine);
    }

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
