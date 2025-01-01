class Sprite {
  constructor({
    position,
    velocity,
    image,
    frames = { max: 1, hold: 10 },
    sprites,
    animate = false,
    rotation = 0,
    scale = 1
  }) {
    this.position = position
    this.image = new Image()
    this.frames = { ...frames, val: 0, elapsed: 0 }
    this.image.onload = () => {
      this.width = (this.image.width / this.frames.max) * scale
      this.height = this.image.height * scale
    }
    this.image.src = image.src

    this.animate = animate
    this.sprites = sprites
    this.opacity = 1

    this.rotation = rotation
    this.scale = scale
  }

  draw() {
    c.save()
    c.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2
    )
    c.rotate(this.rotation)
    c.translate(
      -this.position.x - this.width / 2,
      -this.position.y - this.height / 2
    )
    c.globalAlpha = this.opacity

    const crop = {
      position: {
        x: this.frames.val * (this.width / this.scale),
        y: 0
      },
      width: this.image.width / this.frames.max,
      height: this.image.height
    }

    const image = {
      position: {
        x: this.position.x,
        y: this.position.y
      },
      width: this.image.width / this.frames.max,
      height: this.image.height
    }

    c.drawImage(
      this.image,
      crop.position.x,
      crop.position.y,
      crop.width,
      crop.height,
      image.position.x,
      image.position.y,
      image.width * this.scale,
      image.height * this.scale
    )

    c.restore()

    if (!this.animate) return

    if (this.frames.max > 1) {
      this.frames.elapsed++
    }

    if (this.frames.elapsed % this.frames.hold === 0) {
      if (this.frames.val < this.frames.max - 1) this.frames.val++
      else this.frames.val = 0
    }
  }
}

class Monster extends Sprite {
  constructor({
    position,
    velocity,
    image,
    frames = { max: 1, hold: 10 },
    sprites,
    animate = false,
    rotation = 0,
    isEnemy = false,
    name,
    attacks
  }) {
    super({
      position,
      velocity,
      image,
      frames,
      sprites,
      animate,
      rotation
    })
    this.health = 100
    this.isEnemy = isEnemy
    this.name = name
    this.attacks = attacks
  }

  faint() {
    document.querySelector('#dialogueBox').innerHTML = this.name + ' 는 이가람에게 잡혔다..!'
    gsap.to(this.position, {
      y: this.position.y + 20
    })
    gsap.to(this, {
      opacity: 0
    })
    audio.battle.stop()
    audio.victory.play()
  }

  attack({ attack, recipient, renderedSprites }) {
    document.querySelector('#dialogueBox').style.display = 'block'
    document.querySelector('#dialogueBox').innerHTML =
      this.name + '은(는) ' + attack.name + '를 사용했습니다.'

    let healthBar = '#enemyHealthBar'
    if (this.isEnemy) healthBar = '#playerHealthBar'

    let rotation = 1
    if (this.isEnemy) rotation = -2.2

    if (recipient.health - attack.damage > 10
      && attack.name === '결혼하기'
    ) {
      document.querySelector('#dialogueBox').innerHTML = attack.name + '는 `아직` 송성빈에게 효과가 없어보인다!'
      return
    }
    if (recipient.name === '야생의 송성빈' &&
      recipient.health - attack.damage < 1 &&
      attack.name !== '결혼하기'
    ) {
      document.querySelector('#dialogueBox').innerHTML = attack.name + '는 `더이상` 송성빈에게 효과가 없어보인다!'
      return
    }
    recipient.health -= attack.damage

    switch (attack.name) {
      case 'Fireball':
        audio.initFireball.play()
        const fireballImage = new Image()
        fireballImage.src = './img/fireball.png'
        const fireball = new Sprite({
          position: {
            x: this.position.x,
            y: this.position.y
          },
          image: fireballImage,
          frames: {
            max: 4,
            hold: 10
          },
          animate: true,
          rotation
        })
        renderedSprites.splice(1, 0, fireball)

        gsap.to(fireball.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          onComplete: () => {
            // Enemy actually gets hit
            audio.fireballHit.play()
            gsap.to(healthBar, {
              width: recipient.health + '%'
            })

            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08
            })

            gsap.to(recipient, {
              opacity: 0,
              repeat: 5,
              yoyo: true,
              duration: 0.08
            })
            renderedSprites.splice(1, 1)
          }
        })

        break
      case 'Tackle':
        // const tl = gsap.timeline()

        // let movementDistance = 20
        // if (this.isEnemy) movementDistance = -20

        // tl.to(this.position, {
        //   x: this.position.x - movementDistance
        // })
        //   .to(this.position, {
        //     x: this.position.x + movementDistance * 2,
        //     duration: 0.1,
        //     onComplete: () => {
        //       // Enemy actually gets hit
        //       audio.tackleHit.play()
        //       gsap.to(healthBar, {
        //         width: recipient.health + '%'
        //       })

        //       gsap.to(recipient.position, {
        //         x: recipient.position.x + 10,
        //         yoyo: true,
        //         repeat: 5,
        //         duration: 0.08
        //       })

        //       gsap.to(recipient, {
        //         opacity: 0,
        //         repeat: 5,
        //         yoyo: true,
        //         duration: 0.08
        //       })
        //     }
        //   })
        //   .to(this.position, {
        //     x: this.position.x
        //   })
        break
      case '칭찬하기':
        const hometeImage = new Image()
        hometeImage.src = './img/homete.png'
        const homete = new Sprite({
          position: {
            x: this.position.x,
            y: this.position.y
          },
          image: hometeImage,
          frames: {
            max: 4,
            hold: 5
          },
          animate: true,
          rotation
        })
        renderedSprites.splice(1, 0, homete)

        gsap.to(homete.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          duration:1.5,
          onComplete: () => {
            // Enemy actually gets hit
            audio.fireballHit.play()
            gsap.to(healthBar, {
              width: recipient.health + '%'
            })

            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08
            })

            gsap.to(recipient, {
              opacity: 0,
              repeat: 5,
              yoyo: true,
              duration: 0.08
            })
            renderedSprites.splice(1, 1)
            
          }
        })
        break
      case '포옹하기':
        const hugImage = new Image()
        hugImage.src = './img/hug.png'
        const hug = new Sprite({
          position: {
            x: this.position.x,
            y: this.position.y
          },
          image: hugImage,
          frames: {
            max: 4,
            hold: 5
          },
          animate: true,
          rotation
        })
        renderedSprites.splice(1, 0, hug)

        gsap.to(hug.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          duration:1.5,
          onComplete: () => {
            // Enemy actually gets hit
            audio.fireballHit.play()
            gsap.to(healthBar, {
              width: recipient.health + '%'
            })

            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08
            })

            gsap.to(recipient, {
              opacity: 0,
              repeat: 5,
              yoyo: true,
              duration: 0.08
            })
            renderedSprites.splice(1, 1)
          }
        })
        break
      case '사랑고백하기':
        const loveImage = new Image()
        loveImage.src = './img/love.png'
        const love = new Sprite({
          position: {
            x: this.position.x,
            y: this.position.y
          },
          image: loveImage,
          frames: {
            max: 4,
            hold: 30
          },
          animate: true,
          rotation
        })
        renderedSprites.splice(1, 0, love)

        gsap.to(love.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          duration:1.5,
          onComplete: () => {
            // Enemy actually gets hit
            audio.fireballHit.play()
            gsap.to(healthBar, {
              width: recipient.health + '%'
            })

            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08
            })

            gsap.to(recipient, {
              opacity: 0,
              repeat: 5,
              yoyo: true,
              duration: 0.08
            })
            renderedSprites.splice(1, 1)
          }
        })
        break
      case '결혼하기':
        const cakeImage = new Image()
        cakeImage.src = './img/cake.png'
        const cake = new Sprite({
          position: {
            x: this.position.x,
            y: this.position.y
          },
          image: cakeImage,
          frames: {
            max: 4,
            hold: 60
          },
          animate: true,
          rotation
        })
        renderedSprites.splice(1, 0, cake)

        gsap.to(cake.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          duration:5,
          onComplete: () => {
            // Enemy actually gets hit
            audio.fireballHit.play()
            gsap.to(healthBar, {
              width: recipient.health + '%'
            })

            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08
            })

            gsap.to(recipient, {
              opacity: 0,
              repeat: 5,
              yoyo: true,
              duration: 0.08
            })
            renderedSprites.splice(1, 1)
          }
        })
        break
      case '쓸데없이 고집 부리기':
      case '누나 말 안듣기':
      case '집에 말도없이 쓸데없는 물건 늘리기':

        console.log('song '+attack.name)

        const tl = gsap.timeline()

        let movementDistance = 20
        if (this.isEnemy) movementDistance = -20

        tl.to(this.position, {
          x: this.position.x - movementDistance
        })
          .to(this.position, {
            x: this.position.x + movementDistance * 2,
            duration: 0.1,
            onComplete: () => {
              // Enemy actually gets hit
              audio.tackleHit.play()
              gsap.to(healthBar, {
                width: recipient.health + '%'
              })

              gsap.to(recipient.position, {
                x: recipient.position.x + 10,
                yoyo: true,
                repeat: 5,
                duration: 0.08
              })

              gsap.to(recipient, {
                opacity: 0,
                repeat: 5,
                yoyo: true,
                duration: 0.08
              })
            }
          })
          .to(this.position, {
            x: this.position.x
          })
        break
      case '누나말안듣기':
        break
      case '집에물건추가하기':
        break
    }
  }
}

class Boundary {
  static width = 48
  static height = 48
  constructor({ position }) {
    this.position = position
    this.width = 48
    this.height = 48
  }

  draw() {
    c.fillStyle = 'rgba(255, 0, 0, 0)'
    c.fillRect(this.position.x, this.position.y, this.width, this.height)
  }
}

class Character extends Sprite {
  constructor({
    position,
    velocity,
    image,
    frames = { max: 1, hold: 10 },
    sprites,
    animate = false,
    rotation = 0,
    scale = 1,
    dialogue = ['']
  }) {
    super({
      position,
      velocity,
      image,
      frames,
      sprites,
      animate,
      rotation,
      scale
    })

    this.dialogue = dialogue
    this.dialogueIndex = 0
  }
}
