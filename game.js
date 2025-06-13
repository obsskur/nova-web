
(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;

  // Settings
  const ORB_COUNT = 100;
  const BOT_COUNT = 16;
  const ORB_RADIUS = 5;

  // Game state
  let orbs = [];
  let snakes = [];
  let playerSnake = null;

  // Utils
  function randomColor() {
    // soft random purples, blues, pinks, greens
    const colors = [
      '#b388ff', '#8c66ff', '#7d5fff', '#9b59b6',
      '#3498db', '#1abc9c', '#2ecc71', '#27ae60',
      '#e67e22', '#f39c12', '#d35400', '#e84393'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  function dist(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
  }

  // Orb class
  class Orb {
    constructor() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.radius = ORB_RADIUS;
      this.color = '#b388ff';
    }
    draw() {
      ctx.beginPath();
      ctx.fillStyle = this.color;
      ctx.shadowColor = '#b388ff';
      ctx.shadowBlur = 6;
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  // Snake class
  class Snake {
    constructor(name, isPlayer = false) {
      this.name = name;
      this.isPlayer = isPlayer;
      this.color = randomColor();
      this.speed = 2.5;
      this.segments = [{ x: Math.random() * W, y: Math.random() * H }];
      this.length = 20; // segments count
      this.radiusBase = 10;
      this.score = 0;
      this.dead = false;
      this.respawnTimeout = null;
      this.direction = { x: 1, y: 0 };
      this.targetOrb = null;
      this.mousePos = { x: W / 2, y: H / 2 };
    }

    get radius() {
      // radius grows with score (fatter snake)
      return this.radiusBase + Math.min(this.score / 5, 15);
    }

    update() {
      if (this.dead) return;

      if (this.isPlayer) {
        // Move towards mouse position smoothly
        const head = this.segments[0];
        const dx = this.mousePos.x - head.x;
        const dy = this.mousePos.y - head.y;
        const distToMouse = Math.hypot(dx, dy);
        if (distToMouse > 1) {
          this.direction.x = dx / distToMouse;
          this.direction.y = dy / distToMouse;
        }
      } else {
        // Bots: target closest orb or random movement
        if (!this.targetOrb || this.targetOrbEaten()) {
          this.targetOrb = this.findClosestOrb();
        }
        if (this.targetOrb) {
          const head = this.segments[0];
          const dx = this.targetOrb.x - head.x;
          const dy = this.targetOrb.y - head.y;
          const distToOrb = Math.hypot(dx, dy);
          if (distToOrb > 0) {
            this.direction.x = dx / distToOrb;
            this.direction.y = dy / distToOrb;
          }
        } else {
          // Random drift
          this.direction.x += (Math.random() - 0.5) * 0.2;
          this.direction.y += (Math.random() - 0.5) * 0.2;
          const mag = Math.hypot(this.direction.x, this.direction.y);
          if (mag > 0) {
            this.direction.x /= mag;
            this.direction.y /= mag;
          }
        }
      }

      // Move head forward
      const head = this.segments[0];
      const newX = head.x + this.direction.x * this.speed;
      const newY = head.y + this.direction.y * this.speed;

      // Keep inside bounds (wrap around)
      const wrappedX = (newX + W) % W;
      const wrappedY = (newY + H) % H;

      this.segments.unshift({ x: wrappedX, y: wrappedY });

      // Keep segments length consistent with this.length
      while (this.segments.length > this.length) {
        this.segments.pop();
      }
    }

    targetOrbEaten() {
      if (!this.targetOrb) return true;
      return dist(this.segments[0].x, this.segments[0].y, this.targetOrb.x, this.targetOrb.y) < this.radius + ORB_RADIUS;
    }

    findClosestOrb() {
      if (orbs.length === 0) return null;
      let closest = orbs[0];
      let closestDist = dist(this.segments[0].x, this.segments[0].y, closest.x, closest.y);
      for (let orb of orbs) {
        const d = dist(this.segments[0].x, this.segments[0].y, orb.x, orb.y);
        if (d < closestDist) {
          closest = orb;
          closestDist = d;
        }
      }
      return closest;
    }

    draw() {
      if (this.dead) return;

      ctx.fillStyle = this.color;
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 15;

      // Draw snake segments as circles with increasing radius
      for (let i = 0; i < this.segments.length; i++) {
        const seg = this.segments[i];
        // radius smaller toward tail for nice taper effect
        const radius = this.radius * (1 - i / this.segments.length * 0.7);
        ctx.beginPath();
        ctx.arc(seg.x, seg.y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;

      // Draw name tag above head
      const head = this.segments[0];
      ctx.font = 'bold 14px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff';
      ctx.shadowColor = '#000';
      ctx.shadowBlur = 4;
      ctx.fillText(`${this.name} (${this.score})`, head.x, head.y - this.radius - 10);
      ctx.shadowBlur = 0;
    }

    grow(amount) {
      this.length += amount;
      this.score += amount;
    }

    checkCollision(snakes) {
      if (this.dead) return false;
      const head = this.segments[0];

      // Check collision with other snakes (skip self segments 0..4 to avoid instant self collision)
      for (let snake of snakes) {
        if (snake.dead) continue;
        const startIndex = (snake === this) ? 5 : 0;
        for (let i = startIndex; i < snake.segments.length; i++) {
          const seg = snake.segments[i];
          const radius = snake.radius * (1 - i / snake.segments.length * 0.7);
          if (dist(head.x, head.y, seg.x, seg.y) < radius) {
            return true;
          }
        }
      }
      return false;
    }

    die() {
      this.dead = true;
      this.length = 20;
      this.segments = [{ x: Math.random() * W, y: Math.random() * H }];
      this.score = 0;
      this.targetOrb = null;

      if (this.respawnTimeout) clearTimeout(this.respawnTimeout);
      this.respawnTimeout = setTimeout(() => {
        this.dead = false;
      }, 20000 + Math.random() * 10000); // 20-30 seconds respawn
    }
  }

  // Initialize orbs
  function spawnOrbs() {
    orbs = [];
    for (let i = 0; i < ORB_COUNT; i++) {
      orbs.push(new Orb());
    }
  }

  // Spawn bots
  function spawnBots() {
    snakes = [];
    for (let i = 0; i < BOT_COUNT; i++) {
      const botName = `Bot${i + 1}`;
      snakes.push(new Snake(botName, false));
    }
  }

  // Initialize player snake
  function spawnPlayer() {
    const username = localStorage.getItem('username') || 'Player';
    playerSnake = new Snake(username, true);
    snakes.push(playerSnake);

    // Mouse move to update player target
    window.addEventListener('mousemove', e => {
      const rect = canvas.getBoundingClientRect();
      playerSnake.mousePos = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    });
  }

  // Respawn dead bots after delay
  function manageRespawns() {
    snakes.forEach(snake => {
      if (snake.dead && !snake.respawnTimeout) {
        snake.respawnTimeout = setTimeout(() => {
          snake.dead = false;
          snake.length = 20;
          snake.segments = [{ x: Math.random() * W, y: Math.random() * H }];
          snake.score = 0;
          snake.targetOrb = null;
          snake.respawnTimeout = null;
        }, 20000 + Math.random() * 10000);
      }
    });
  }

  // Check orb collisions and snake collisions
  function checkCollisions() {
    snakes.forEach(snake => {
      if (snake.dead) return;

      // Check collision with orbs
      for (let i = orbs.length - 1; i >= 0; i--) {
        if (dist(snake.segments[0].x, snake.segments[0].y, orbs[i].x, orbs[i].y) < snake.radius + orbs[i].radius) {
          orbs.splice(i, 1);
          snake.grow(3);
          // Spawn new orb somewhere random
          orbs.push(new Orb());
        }
      }

      // Check collision with other snakes
      if (snake.checkCollision(snakes)) {
        snake.die();
      }
    });
  }

  // Draw leaderboard top 10
  function drawLeaderboard() {
    const leaderboardX = W - 200;
    const leaderboardY = 40;
    const lineHeight = 22;

    ctx.fillStyle = '#222';
    ctx.globalAlpha = 0.7;
    ctx.fillRect(leaderboardX - 15, leaderboardY - 30, 180, 280);
    ctx.globalAlpha = 1;

    ctx.fillStyle = '#b388ff';
    ctx.font = 'bold 20px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Leaderboard', leaderboardX, leaderboardY);

    ctx.font = '14px Inter, sans-serif';
    ctx.fillStyle = '#fff';

    // Sort snakes by score desc, exclude dead
    const topSnakes = snakes
      .filter(s => !s.dead)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    topSnakes.forEach((snake, i) => {
      ctx.fillText(`${i + 1}. ${snake.name} (${snake.score})`, leaderboardX, leaderboardY + 30 + i * lineHeight);
    });
  }

  // Game Loop
  function gameLoop() {
    ctx.clearRect(0, 0, W, H);

    // Update snakes
    snakes.forEach(snake => snake.update());

    // Check collisions (orbs & snakes)
    checkCollisions();

    // Draw orbs
    orbs.forEach(orb => orb.draw());

    // Draw snakes
    snakes.forEach(snake => snake.draw());

    // Draw leaderboard
    drawLeaderboard();

    // Manage respawns
    manageRespawns();

    requestAnimationFrame(gameLoop);
  }

  // Init game
  window.initGame = () => {
    spawnOrbs();
    spawnBots();
    spawnPlayer();
    gameLoop();
  };
})();
