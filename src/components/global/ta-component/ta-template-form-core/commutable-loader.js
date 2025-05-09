const { existsSync, readFileSync } = require('fs');

function loader(source) {
  // if (this.request.includes('.commutable.vue')) {
  const newPath = this.resourcePath.replace(/\/engines\/(.+?)\//, '/');
  if (existsSync(newPath)) {
    this.addDependency(newPath);
    const result = readFileSync(newPath);
    return result;
  }
  // }

  const newPath2 = this.resourcePath.replace(/\/engines\//, '/');
  if (existsSync(newPath2)) {
    this.addDependency(newPath2);
    const result = readFileSync(newPath2);
    return result;
  }
  return source;
}

module.exports = loader;
