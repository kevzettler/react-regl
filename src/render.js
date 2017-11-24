import { ReglRenderer } from './renderer.js';


const Root {
  constructor() {
    //noop
  }
}

export const render = (element, drawingContext) => {
  //TODO validate element
  //TODO validate drawingContext

  const node = ReglRenderer.createContainer(new Root);
  ReglRenderer.updateContainer(element, node, null);

  /* await new Promise((resolve, reject) => {
   *   output.doc.generate(stream, Events(filePath, resolve, reject));

   *   openDocApp(filePath);
   * });*/
}
