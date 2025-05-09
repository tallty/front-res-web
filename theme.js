const str = require('fs').readFileSync('./theme.styl', 'utf8');

const result = str.split('\n').reduce((out, line) => {
  // line: "$primary-color = red // 全局主色"
  const value = line.split('//').slice(0, -1)[0]; // 去掉注释
  if (value) {
    const kv = value
      .split(/\$|=/)
      .map(i => i.trim())
      .filter(i => i);
    out[kv[0]] = kv[1];
  }
  return out;
}, {});

console.log(`theme options: ${result}`);

module.exports = result;
