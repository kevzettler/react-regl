import Node from '../nodes/Node.js';
import {
  reduce as _reduce,
  isArrayLike as _isArrayLike
} from 'lodash';

const reglWhitelist = [
  'vert', 'frag', 'primitive',
  'offset', 'instances', 'elements', 'profile', 'depth',
  'blend', 'stencil', 'cull', 'polygonOffset', 'scissor'
];

function uniformArrayUnrollReducer(regl, definitionKey, reglProp, accum, value, index){
  accum[`${reglProp}[${index}]`] = regl.prop(`${definitionKey}.${reglProp}[${index}]`)
  return accum;
}


function attributesReducer(props, regl, definitionKey, acc, reglProp){
  if(props[definitionKey][reglProp].buffer){
    acc[reglProp] = { ...props[definitionKey][reglProp] };
    acc[reglProp] = {
      buffer : regl.prop(`${definitionKey}.${reglProp}.buffer`)
    };
    return acc;
  }

  /*
   * if an array is being passed as a react prop
   * convert and cache it to a regl buffer
   */
  /* if(!props[definitionKey][reglProp].buffer &&
   *    _isArrayLike(props[definitionKey][reglProp])){

   *   //update the definition to be a buffer definition
   *   acc[reglProp] = {
   *     buffer : regl.prop(`${definitionKey}.${reglProp}`)
   *   };

   *   //update the execution prop to be a regl.buffer
   *   const buff = regl.buffer({
   *     data: this.executionProps[reglProp],
   *     usage: 'static',
   *     type: 'float32',
   *   })
   *   buff._buffer.id = reglProp;

   *   this.executionProps[reglProp] = buff;

   *   return acc;
   * }*/


  acc[reglProp] = regl.prop(`${definitionKey}.${reglProp}`);
  return acc;
}

function uniformsReducer(props, regl, definitionKey, acc, reglProp){
  //Need to unroll array uniforms
  // https://github.com/regl-project/regl/issues/258
  // https://github.com/regl-project/regl/issues/373
  if(definitionKey === 'uniforms' &&
     Array.isArray(props[definitionKey][reglProp]) &&
     props[definitionKey][reglProp].filter((ele) => { return Array.isArray(ele)}).length > 0
  ){
    const unrolled = [...Array(props[definitionKey][reglProp].length)].reduce(uniformArrayUnrollReducer.bind(this, regl, definitionKey, reglProp), {});
    return {...acc, ...unrolled};
  }

  acc[reglProp] = regl.prop(`${definitionKey}.${reglProp}`);
  return acc;
}

//Iterate over top level react component keys like attributes, uniforms, count, elements
function topLevelKeyReducer(reactProps, regl, reglDefinition, topLevelDefinitionKey){
  if(reglWhitelist.indexOf(topLevelDefinitionKey) !== -1){
    reglDefinition[topLevelDefinitionKey] = reactProps[topLevelDefinitionKey];
    return reglDefinition;
  }


  if(['attributes'].indexOf(topLevelDefinitionKey) !== -1){
//    this.bufferAttributes(reactProps[topLevelDefinitionKey], regl);
    reglDefinition[topLevelDefinitionKey] = Object.keys(reactProps[topLevelDefinitionKey])
                                                  .reduce(attributesReducer.bind(this, reactProps, regl, topLevelDefinitionKey), {});
    return reglDefinition;
  }

  if(['uniforms'].indexOf(topLevelDefinitionKey) !== -1){
    reglDefinition[topLevelDefinitionKey] = Object.keys(reactProps[topLevelDefinitionKey])
                                                  .reduce(uniformsReducer.bind(this, reactProps, regl, topLevelDefinitionKey), {});
    return reglDefinition;
  }


  if(['string', 'number', 'boolean'].indexOf(typeof reactProps[topLevelDefinitionKey]) !== -1){
    reglDefinition[topLevelDefinitionKey] = regl.prop(topLevelDefinitionKey);
    return reglDefinition;
  }

  if(reglWhitelist.indexOf(topLevelDefinitionKey) !== -1){
    reglDefinition[topLevelDefinitionKey] = regl.prop(topLevelDefinitionKey);
    return reglDefinition;
  }

  return reglDefinition;
};

/* Returns a regl 'definition' object based on the props passed to the react component node
 * that is traditionally used when defining a regl draw command
 * example
 *
 * regl({
 *
 *   // In a draw call, we can pass the shader source code to regl
 *   frag: `....`,
 *
 *   vert: `...}`,
 *
 *   attributes: {
 *     position: [
 *       [-1, 0],
 *       [0, -1],
 *       [1, 1]
 *     ]
 *   },
 *
 *   uniforms: {
 *     color: [1, 0, 0, 1]
 *   },
 *
 *   count: 3
 * })
 * */

export default class DrawNode extends Node {
  constructor(props, regl){
    super(props, regl);
    this.regl = regl;
    this.setDrawState(props,regl);
  }

  getReglDrawDefinitionFromProps(reactProps, regl){
    return Object.keys(reactProps).reduce(topLevelKeyReducer.bind(this, reactProps, regl), {});
  }

  updateProps(oldProps, newProps){
//    debugger;
  }

  setDrawState(props, regl){
    this.executionProps = {...props};

    //cache the 'execution time' attributes as regl buffers otherwise regl will attempt to bufferize on every draw call
    this.executionProps.attributes = _reduce(props.attributes, (acc, value, key) => {
      const buff = regl.buffer({
        data: value,
        usage: 'static',
        type: 'float32',
      });
      buff._buffer.id = key

      acc[key] = buff;
      return acc;
    }, {});

    this.reglDef = this.getReglDrawDefinitionFromProps(props, regl)
    this.drawKey = JSON.stringify(this.reglDef);

    if(regl.cache[this.drawKey]){
      this.drawCommand = regl.cache[this.drawKey];
    }else{
      this.drawCommand = regl(this.reglDef);
      regl.cache[this.drawKey] = this.drawCommand;
    }
  }

  /* bufferAttributes(attributes, regl){
   *   const attributeNames = Object.keys(attributes);

   *   const funcBody = attributeNames.map((attributeName) => {
   *     return `attributes.${attributeName}[index],`;
   *   }).join('\n');


   *   const output = eval(`
   *    attributes[attributeNames[0]].reduce((acc, value, index) => {
   *      acc = acc.concat(${funcBody});
   *      return acc;
   *    }, []);
   *  `);


   *   const offsets = {};
   *   let flatComponents = [];
   *   for(var x = 0; x<attributeNames.length; x++){
   *     offsets[attributeNames[x]] = {
   *       size: attributes[attributeNames[x]][0].length * 4 || 4,
   *       offset: flatComponents.length * 4,
   *     }
   *     flatComponents = flatComponents.concat(attributes[attributeNames[x]][0])
   *   }

   *   for(var x =0; x<attributeNames.length; x++){
   *     offsets[attributeNames[x]].stride = flatComponents.length * 4
   *   }


   *   regl.buffer({
   *     data: combinedModelBuffs,
   *     usage: 'dynamic',
   *     type: 'float32',
   *   })
   * }*/

}
