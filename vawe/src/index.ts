import {
  Application, filters, Loader, Sprite, WRAP_MODES,
} from 'pixi.js';
import { autoDetectRenderer, RGBSplitFilter } from 'pixi-filters';

const section = document.querySelector('section');

if (section) {
  const imageElement = section.querySelector('img');
  const imageSource = imageElement?.getAttribute('src');
  const displacementImageElement = document.querySelector('.displacement1');
  const displacementImageSource = displacementImageElement?.getAttribute('src');

  if (imageElement && imageSource && displacementImageSource) {
    section.innerHTML = '';

    const app = new Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundAlpha: 0,
    });

    section.appendChild(app.view);

    let image: Sprite;
    let displacementImage: Sprite;
    const rgbFilter = new RGBSplitFilter([0, 0], [0, 0], [0, 0]);

    const loader = new Loader();

    loader.add('image', imageSource);
    loader.add('displacementImage', displacementImageSource);

    loader.load((loader, resources) => {
      image = new Sprite(resources.image.texture);
      displacementImage = new Sprite(resources.displacementImage.texture);

      displacementImage.width = 600;
      displacementImage.height = 600;
      displacementImage.texture.baseTexture.wrapMode = WRAP_MODES.REPEAT;

      image.x = window.innerWidth / 2;
      image.y = window.innerHeight / 2;
      image.width = window.innerWidth;
      image.height = window.innerHeight;
      image.interactive = true;

      image.anchor.x = 0.5;
      image.anchor.y = 0.5;

      image.filters = [
        // new filters.BlurFilter(3, 5),
        new filters.DisplacementFilter(displacementImage, 100),
        rgbFilter,
      ];
      // app.stage.addChild(Sprite.from(imageSource));
      app.stage.addChild(image);
      app.stage.addChild(displacementImage);

      // app.ticker.add(() => {
      //   displacementImage.rotation += 0.01;
      //   displacementImage.x += 1;
      //   displacementImage.y += 1;
      // });
    });

    let currentX = 0;
    let aimX = 0;

    let currentY = 0;
    let aimY = 0;

    section.addEventListener('mousemove', (event) => {
      aimX = event.pageX;
      aimY = event.pageY;
      // displacementImage.y = event.pageY;
    });

    const animate = function () {
      const diffX = aimX - currentX;
      const diffY = aimY - currentY;

      currentX += (diffX * 0.05);
      currentY += (diffY * 0.05);

      if (displacementImage) {
        displacementImage.x = displacementImage.x + 1 + (diffX * 0.01);
        displacementImage.y = displacementImage.y + 1 + (diffY * 0.01);
        // displacementImage.x = currentX;
        // displacementImage.y = currentY;
        rgbFilter.red = [diffX * 0.1, 0];
        rgbFilter.green = [0, diffY * 0.1];
      }

      requestAnimationFrame(animate);
    };

    animate();
  }
}
