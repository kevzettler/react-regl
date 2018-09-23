import Node from '../nodes/Node.js';
import {
  reduce as _reduce,
  isEqual as _isEqual
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
    acc[reglProp] = {
      ...props[definitionKey][reglProp],
      buffer: regl.buffer(props[definitionKey][reglProp].buffer)
    };
    return acc;
  }

  acc[reglProp] = regl.prop(`${definitionKey}.${reglProp}`);
  return acc;
}

function inferResourceType(regl, resourcePayload){
  if(resourcePayload.reglResourceType && typeof regl[resourcePayload.reglResourceType] === 'function'){
    return regl[resourcePayload.reglResourceType];
  }
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

  if(typeof props[definitionKey][reglProp] === 'function'){
    acc[reglProp] = props[definitionKey][reglProp];
    return acc;
  }

  //if data prop is passed assume its a complex regl resource type buffer,elements,textures
  if(props[definitionKey][reglProp].reglResourceType || props[definitionKey][reglProp].data){
    const resourceConstructor = inferResourceType(regl, props[definitionKey][reglProp]);
    acc[reglProp] = resourceConstructor(props[definitionKey][reglProp]);
    return acc;
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


export default class DrawNode extends Node {
  constructor(props, regl){
    super(props, regl);
    this.regl = regl;
    this.setDrawState(props,regl);
  }


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
   *
   */
  getReglDrawDefinitionFromProps(reactProps, regl){
    return Object.keys(reactProps).reduce(topLevelKeyReducer.bind(this, reactProps, regl), {});
  }

  updateProps(oldProps, newProps){
    //TODO update the drawNodes props
    // regenerate the instances draw command if the shaders have changed
    // If the executionProps change update any attribute buffers
    // if the definitionProps change need to re init the drawCall
    this.executionProps.uniforms = newProps.uniforms;
    this.executionProps.count = newProps.count;

    if(newProps.attributes){
      Object.keys(newProps.attributes).forEach((newAttributeKey) => {
        if(!oldProps.attributes[newAttributeKey]){
          //TODO theres a new attribute passed to props. This needs to regenerate draw call?
        }

        //the new attribute dosen't match the old, update the buffer
        if(!_.isEqual(oldProps.attributes[newAttributeKey], newProps.attributes[newAttributeKey])){
          this.executionProps.attributes[newAttributeKey](newProps.attributes[newAttributeKey]);
        }
      })

    }
  }

  setDrawState(props, regl){
    this.lastProps = props;
    this.executionProps = {...props};

    //cache the 'execution time' attributes as regl buffers otherwise regl will attempt to bufferize on every draw call
    this.executionProps.attributes = _reduce(props.attributes, (acc, value, key) => {
      if(!value.buffer){
        const buff = regl.buffer({
          data: value,
          usage: 'static',
          type: 'float32',
        });
        buff._buffer.id = key

        acc[key] = buff;
      }
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

}
