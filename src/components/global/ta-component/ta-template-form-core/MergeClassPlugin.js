const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

class MergeClassPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('MergeClassPlugin', (compilation, callback) => {
      const { source, target } = this.options;

      try {
        const sourceCode = fs.readFileSync(source, 'utf-8');
        const targetCode = fs.readFileSync(target, 'utf-8');

        const sourceAst = parser.parse(sourceCode, {
          sourceType: 'module',
          plugins: ['typescript'],
        });

        const targetAst = parser.parse(targetCode, {
          sourceType: 'module',
          plugins: ['typescript'],
        });

        let sourceClassMembers = new Map();
        traverse(sourceAst, {
          ClassDeclaration(path) {
            const className = path.node.id.name;
            sourceClassMembers.set(className, path.node.body.body);
            console.log(`Found source class: ${className}`);
          },
        });

        let merged = false;
        traverse(targetAst, {
          ClassDeclaration(path) {
            const className = path.node.id.name;
            // this.addDependency(path);
            if (sourceClassMembers.has(className)) {
              console.log(`Merging into target class: ${className}`);
              const sourceMembers = sourceClassMembers.get(className);
              const targetClassBody = path.node.body;

              sourceMembers.forEach(member => {
                console.log(`Checking member: ${member.key.name}`);
                if (
                  !targetClassBody.body.some(m => {
                    console.log(m.key, m.key.name, m.key && m.key.name === member.key.name);
                    return m.key && m.key.name === member.key.name;
                  })
                ) {
                  console.log(`Merging member: ${member.key.name}`);
                  targetClassBody.body.push(t.cloneNode(member, true));
                  merged = true;
                }
              });
            }
          },
        });

        if (!merged) {
          console.log('No new members to merge or no matching classes found');
        }

        const output = generate(targetAst, { retainLines: true }, targetCode);

        const relativeTarget = path.relative(compiler.context, target);
        compilation.assets[relativeTarget] = {
          source: () => output.code,
          size: () => output.code.length,
        };

        console.log(`Updated ${relativeTarget}`);

        console.log(output.code);
      } catch (error) {
        console.error('Error in MergeClassPlugin:', error);
      }

      callback();
    });
  }
}

module.exports = MergeClassPlugin;
