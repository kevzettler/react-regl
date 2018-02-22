import Node from '../nodes/Node.js';

function definitionPropReducer(props, regl, definitionKey, acc, reglProp){
  //Need to unroll array uniforms
  // https://github.com/regl-project/regl/issues/258
  // https://github.com/regl-project/regl/issues/373
  if(definitionKey === 'uniforms' &&
     Array.isArray(props[definitionKey][reglProp]) &&
     props[definitionKey][reglProp].filter((ele) => { return Array.isArray(ele)}).length > 0
  ){
    const unrolled = [...Array(props[definitionKey][reglProp].length)].reduce((accum, value, index) => {
      accum[`${reglProp}[${index}]`] = regl.prop(`${definitionKey}.${reglProp}[${index}]`)
      return accum;
    }, {});

    //return acc[reglProp] = unrolled;
    //not sure what this was doing cloning props?
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

const getReglDrawDefinitionFromProps = (props, regl) =>{
  const reglDefinition = {};

  const reglWhitelist = [
    'vert', 'frag', 'primitive',
    'offset', 'instances', 'elements', 'profile', 'depth',
    'blend', 'stencil', 'cull', 'polygonOffset', 'scissor'
  ];

  Object.keys(props).forEach((definitionKey) => {
    if(reglWhitelist.indexOf(definitionKey) !== -1){
      reglDefinition[definitionKey] = props[definitionKey];
      return;
    }

    //iterate over sub level keys for position and uniforms
    if(['attributes', 'uniforms'].indexOf(definitionKey) !== -1){
      reglDefinition[definitionKey] = Object.keys(props[definitionKey])
                                            .reduce(definitionPropReducer.bind(this, props, regl, definitionKey), {});
    }

    if(['string', 'number', 'boolean'].indexOf(typeof props[definitionKey]) !== -1){
      reglDefinition[definitionKey] = regl.prop(definitionKey);
      return;
    }

    if(reglWhitelist.indexOf(definitionKey) !== -1){
      reglDefinition[definitionKey] = regl.prop(definitionKey);
    }
  });

  return reglDefinition;
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
