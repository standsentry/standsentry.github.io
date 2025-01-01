const battleBackgroundImage = new Image();
battleBackgroundImage.src = './img/battleBackground.png';
const battleBackground = new Sprite({
  position: { x: 0, y: 0 },
  image: battleBackgroundImage,
});

const endSceneImage = new Image();
endSceneImage.src = './img/endScene2.gif';

let draggle, emby, renderedSprites, battleAnimationId, queue;

function showEndScene() {
  window.cancelAnimationFrame(battleAnimationId)

  document.querySelector('#userInterface').style.display = 'none';

  const canvas = document.querySelector('canvas');
  canvas.style.display = 'none'

  // GIF 이미지 추가
  const gifElement = document.createElement('img');
  gifElement.src = './img/endScene2.gif'; // GIF 파일 경로
  gifElement.style.position = 'absolute';
  gifElement.style.top = '0';
  gifElement.style.left = '0';
  gifElement.style.width = '100%';
  gifElement.style.height = '100%';
  gifElement.style.zIndex = '100'; // 가장 위에 표시
  document.body.appendChild(gifElement);

  // 몇 초 후 게임 종료
  setTimeout(() => {
    alert('게임이 종료되었습니다! 감사합니다!');
    window.location.reload(); // 게임 초기화
  }, 500000); // 5초 대기
}

function initBattle() {
  document.querySelector('#userInterface').style.display = 'block';
  document.querySelector('#dialogueBox').style.display = 'none';
  document.querySelector('#enemyHealthBar').style.width = '100%';
  document.querySelector('#playerHealthBar').style.width = '100%';
  document.querySelector('#attacksBox').replaceChildren();

  draggle = new Monster(monsters.Draggle);
  emby = new Monster(monsters.Emby);
  renderedSprites = [draggle, emby];
  queue = [];

  emby.attacks.forEach((attack) => {
    const button = document.createElement('button');
    button.innerHTML = attack.name;
    document.querySelector('#attacksBox').append(button);
  });

  document.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML];
      emby.attack({
        attack: selectedAttack,
        recipient: draggle,
        renderedSprites,
      });

      if (draggle.health <= 0) {
        queue.push(() => {
          draggle.faint();
        });
        queue.push(() => {
          setTimeout(showEndScene, 2000);
        });
      }

      const randomAttack =
        draggle.attacks[Math.floor(Math.random() * draggle.attacks.length)];

      queue.push(() => {
        draggle.attack({
          attack: randomAttack,
          recipient: emby,
          renderedSprites,
        });

        if (emby.health <= 0) {
          queue.push(() => {
            emby.faint();
          });
          queue.push(() => {
            gsap.to('#overlappingDiv', {
              opacity: 1,
              onComplete: () => {
                cancelAnimationFrame(battleAnimationId);
                animate();
                document.querySelector('#userInterface').style.display = 'none';

                gsap.to('#overlappingDiv', { opacity: 0 });

                battle.initiated = false;
                audio.Map.play();
              },
            });
          });
        }
      });
    });

    button.addEventListener('mouseenter', (e) => {
      const selectedAttack = attacks[e.currentTarget.innerHTML];
      document.querySelector('#attackType').innerHTML = selectedAttack.type;
      document.querySelector('#attackType').style.color = selectedAttack.color;
    });
  });
}

function animateBattle() {
  battleAnimationId = window.requestAnimationFrame(animateBattle);
  battleBackground.draw();

  renderedSprites.forEach((sprite) => {
    sprite.draw();
  });
}

animate();

document.querySelector('#dialogueBox').addEventListener('click', (e) => {
  if (queue.length > 0) {
    queue[0]();
    queue.shift();
  } else e.currentTarget.style.display = 'none';
});
