document.addEventListener('DOMContentLoaded', () => {
  const commandInput = document.getElementById('command');
  const outputDiv = document.getElementById('output');
  const commandLogDiv = document.getElementById('command-log');

  const commands = {
    clear: () => {
      outputDiv.textContent = '';
    },
    cmd: () => {
      return Object.keys(commands).join(', ');
    }
  };

  function appendCommandLog(text) {
    const time = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.textContent = `${time}: $ ${text}`;
    commandLogDiv.appendChild(entry);
    commandLogDiv.scrollTop = commandLogDiv.scrollHeight;
  }

  function appendOutput(text) {
    const time = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.textContent = `${time}: ${text}`;
    outputDiv.appendChild(entry);
    outputDiv.scrollTop = outputDiv.scrollHeight;
  }

  commandInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const input = commandInput.value.trim();
      if (input === '') return;

      appendCommandLog(input);

      const [cmd, ...args] = input.split(' ');
      if (commands[cmd]) {
        const result = commands[cmd](...args);
        if (result) appendOutput(result);
      } else {
        appendOutput(`Unrecognised Command - "${input}"`);
      }

      commandInput.value = '';
    }
  });
});
