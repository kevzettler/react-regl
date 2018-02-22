import Node from '../nodes/Node.js';

const reglWhitelist = [
  'vert', 'frag', 'primitive',
  'offset', 'instances', 'elements', 'profile', 'depth',
  'blend', 'stencil', 'cull', 'polygonOffset', 'scissor'
];

function uniformArrayUnrollReducer(regl, definitionKey, reglProp, accum, value, index){
  accum[`${reglProp}[${index}]`] = regl.prop(`${definitionKey}.${reglProp}[${index}]`)
  return accum;
}

function subLevelPropReducer(props, regl, definitionKey, acc, reglProp){
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

  //TODO need guard for undefined props[definitionKey][reglProp]
  if(props[definitionKey][reglProp].buffer){
    reglDefinition[definitionKey][reglProp] = { ...props[definitionKey][reglProp] };
    return acc[reglProp] = {buffer : regl.prop(`${definitionKey}.${reglProp}.buffer`)};
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

  //iterate over sub level keys for position and uniforms
  if(['attributes', 'uniforms'].indexOf(topLevelDefinitionKey) !== -1){
    reglDefinition[topLevelDefinitionKey] = Object.keys(reactProps[topLevelDefinitionKey])
                                          .reduce(subLevelPropReducer.bind(this, reactProps, regl, topLevelDefinitionKey), {});
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

const getReglDrawDefinitionFromProps = (reactProps, regl) =>{
  return Object.keys(reactProps).reduce(topLevelKeyReducer.bind(this, reactProps, regl), {});
}

export default class DrawNode extends Node {
  constructor(props, regl){
    super(props, regl);
    this.regl = regl;
    this.setDrawState(props,regl);
  }

  setDrawState(props, regl){
    this.packedProps = props;
    this.reglDef = getReglDrawDefinitionFromProps(props, regl);
    this.drawKey = JSON.stringify(this.reglDef);

    if(regl.cache[this.drawKey]){
      this.drawCommand = regl.cache[this.drawKey];
    }else{
      this.drawCommand = regl(this.reglDef);
      regl.cache[this.drawKey] = this.drawCommand;
    }
  }

}
