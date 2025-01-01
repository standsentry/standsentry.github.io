const monsters = {
  Emby: {
    position: {
      x: 250,
      y: 250
    },
    image: {
      src: './img/embySprite.png'
    },
    frames: {
      max: 4,
      hold: 30
    },
    animate: true,
    name: '이가람',
    attacks: [attacks.칭찬하기, attacks.포옹하기, attacks.사랑고백하기, attacks.결혼하기]
  },
  Draggle: {
    position: {
      x: 725,
      y: 15
    },
    image: {
      src: './img/draggleSprite.png'
    },
    frames: {
      max: 8,
      hold: 20
    },
    animate: true,
    isEnemy: true,
    name: '야생의 송성빈',
    attacks: [attacks.고집부리기, attacks.누나말안듣기, attacks.집에물건추가하기]
  }
}
