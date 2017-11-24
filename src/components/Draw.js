import React, { Component } from 'react';

const Draw = "Draw";


export default Draw;

/* if you export a class react will immediatly try to mount it as a traditional component
if you export a string it will enter the reconciler instanciation process and let you customize the node creation

/* export default class Draw {
 *   constructor(props, context){
 *     debugger;
 *   }
 *
 *   draw(){
 *     debugger;
 *   }
 *
 *   render(){
 *     this.draw();
 *   }
 * }*/
