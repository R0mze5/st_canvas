

// import svg from '../lineup.svg'
// 
// console.log(svg)


class Drawer {
  private canvasInElementClassName = 'in'
  private canvasOutElementClassName = 'out'
  public canvasInElement: HTMLCanvasElement;
  public canvasOutElement: HTMLCanvasElement;
  private isDrawing = false

  constructor() {
    this.canvasInElement = this.createElement(this.canvasInElementClassName);
    this.canvasOutElement = this.createElement(this.canvasOutElementClassName);

    window.addEventListener('resize', () => {
      this.init(this.canvasInElement)
      this.init(this.canvasOutElement)

    })

    this.init(this.canvasInElement)
    this.init(this.canvasOutElement)
  }

  createElement(className: string) {
    const sectionPatternElement = document.createElement('section')
    sectionPatternElement.classList.add(`scratched-${className}`)


    if(className === this.canvasInElementClassName) {
      const patternElement = document.createElement('div')
      patternElement.classList.add('pattern')
      sectionPatternElement.appendChild(patternElement)
    } else {
      const patternElement = document.createElement('div')
      patternElement.classList.add('lineup')
      sectionPatternElement.appendChild(patternElement)

      const imageElement = document.createElement('img');
      imageElement.classList.add('lineup')

      patternElement.appendChild(imageElement)
    }

    const canvasElement = document.createElement('canvas')
    canvasElement.classList.add(className)
    sectionPatternElement.appendChild(canvasElement)

    document.body.appendChild(sectionPatternElement)

    return canvasElement
  }

  init(canvasElement:HTMLCanvasElement) {
    const w = window.innerWidth
    const h = window.outerHeight

    const dpi = window.devicePixelRatio

    canvasElement.width = w * dpi
    canvasElement.height = h * dpi

    canvasElement.style.width = w + 'px'
    canvasElement.style.height = h + 'px'

    const context = canvasElement.getContext('2d') 

    if(context) {
      context.scale(dpi, dpi)
      if(canvasElement.classList.contains(this.canvasInElementClassName)) {
        context.fillStyle = '#ffffff'
        context.strokeStyle  = '#000000'
      } else {
        context.strokeStyle = '#ffffff'
        context.fillStyle  = '#000000'
      }
      context.lineWidth = 80
      context.lineCap = "round"
      context.lineJoin = "round"
      context.shadowBlur = 10
      context.shadowColor = context.strokeStyle


      context.rect(0,0,  w ,h )
      context.fill()
    }

  }

  moveDraw = (canvasElement:HTMLCanvasElement, x:number, y:number) => {
    const context = canvasElement.getContext('2d') 

    if(context && this.isDrawing) {
      context.lineTo(x,y)
      context.stroke()
    } 
  }

  startDraw = (canvasElement:HTMLCanvasElement, x:number, y:number) => {
    this.isDrawing = true
    const context = canvasElement.getContext('2d') 

    if(context) {
      context.moveTo(x, y)
      context.beginPath()
    }
  }

  endDraw = () => {
    this.isDrawing = false
  }

}

class Cursor {
  private cursorClassName = 'cursor'
  private cursorIncreasedClassName = 'is-down'
  private cursorElement: HTMLElement;
  private drawer?: Drawer;

  constructor({drawer}: {drawer: Drawer}) {

    const cursor = document.createElement('div')
    cursor.classList.add(this.cursorClassName)

    document.body.appendChild(cursor)

    this.cursorElement = cursor;

    if(drawer) {
      this.drawer = drawer
    }

    this.init()
  }

  init() {
    document.addEventListener('mousedown', this.increaseCursor.bind(this))
    document.addEventListener('mouseup', this.decreaseCursor.bind(this))
    document.addEventListener('mousemove', this.moveCursor.bind(this))
  }

  increaseCursor(event: MouseEvent) {
    const { pageX, pageY } = event
    this.cursorElement.classList.add(this.cursorIncreasedClassName)
    this.drawer?.startDraw(this.drawer.canvasInElement , pageX, pageY)
    this.drawer?.startDraw(this.drawer.canvasOutElement, pageX, pageY)
  }

  decreaseCursor() {
    this.cursorElement.classList.remove(this.cursorIncreasedClassName)
    this.drawer?.endDraw()
  }

  moveCursor(event: MouseEvent) {
    const { pageX, pageY } = event

    this.cursorElement.style.left = `${pageX}px`
    this.cursorElement.style.top = `${pageY}px`

    this.drawer?.moveDraw(this.drawer.canvasInElement ,pageX, pageY)
    this.drawer?.moveDraw(this.drawer.canvasOutElement,pageX, pageY)

  }
}


new Cursor({drawer: new Drawer()})