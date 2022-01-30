import Matter, {
  Bodies, Composites, Engine, IBodyDefinition, Mouse, MouseConstraint, Query, Render, Runner, World,
} from 'matter-js';

import MatterWrap from 'matter-wrap';

Matter.use(MatterWrap);

const sectionElement = document.createElement('section');
sectionElement.classList.add('shapes');
document.body.appendChild(sectionElement);

const sectionSplitElement = document.createElement('section');
sectionSplitElement.classList.add('split');
document.body.appendChild(sectionSplitElement);

const h = window.innerHeight;
const w = window.innerWidth;

const engine = Engine.create();
const renderer = Render.create({
  element: sectionElement,
  engine,
  options: {
    height: h,
    width: w,
    background: '#000000',
    wireframes: false,
    pixelRatio: window.devicePixelRatio,
  },
});

function createShape(x:number, y:number) {
  return Bodies.circle(x, y, 30, {
    // frictionAir: 0.1,

    render: {
      sprite: {
        texture: './circles.png',
        xScale: 0.15,
        yScale: 0.15,
      },
    },
    plugin: {
      wrap: {
        min: { x: 0, y: 0 },
        max: { x: w, y: h },
      },
    },

  });
}

const bigBall = Bodies.circle(w / 2, h / 2, Math.min(w / 4, h / 4), {
  isStatic: true,
  render: {
    fillStyle: '#ffffff',
  },
});

const wallOptions:IBodyDefinition = {
  isStatic: true,
  render: {
    visible: false,
  },
};

const ground = Bodies.rectangle(w / 2, h + 50, w, 100, wallOptions);
const ceiling = Bodies.rectangle(w / 2, -50, w + 100, 100, wallOptions);
// const leftWall = Bodies.rectangle(-50, h / 2, 100, h + 100, wallOptions);
// const rightWall = Bodies.rectangle(w + 50, h / 2, 100, h + 100, wallOptions);

const mouse = Mouse.create(renderer.canvas);
const mouseControl = MouseConstraint.create(engine, {
  element: sectionElement,
  mouse,
  constraint: {
    stiffness: 0.2,
    type: '',
    render: {
      visible: false,
    },
  },
  // type: sectionElement
});

const initialShapes = Composites.stack(50, 50, 15, 5, 40, 40, createShape);

World.add(engine.world, [
  initialShapes, bigBall, ground, ceiling, /* leftWall, rightWall, */ mouseControl,
]);

sectionElement.addEventListener('click', (event:MouseEvent) => {
  const { pageX, pageY } = event;

  const hoveredShapes = Query.point(initialShapes.bodies, { x: event.pageX, y: event.pageY });

  if (hoveredShapes.length) return;

  const shape = createShape(pageX, pageY);
  initialShapes.bodies.push(shape);

  World.add(engine.world, shape);
});

// sectionElement.addEventListener('mousemove', (event: MouseEvent) => {
//   const vector = { x: event.pageX, y: event.pageY };
//   const hoveredShapes = Query.point(initialShapes.bodies, vector);

//   hoveredShapes.forEach((shape) => {
//     shape.render.sprite = undefined;
//   });
// });

Runner.run(engine);
Render.run(renderer);

// let time = 0;
// function changeGravity() {
//   time += 0.01;

//   const gravity = Math.cos(time);

//   engine.gravity.y = gravity;

//   requestAnimationFrame(changeGravity);
// }

// changeGravity();

window.addEventListener('deviceorientation', (event) => {
  const { gamma, beta } = event;

  engine.gravity.x = gamma !== null ? gamma / 30 : engine.gravity.x;
  engine.gravity.y = beta !== null ? beta / 30 : engine.gravity.y;
});
