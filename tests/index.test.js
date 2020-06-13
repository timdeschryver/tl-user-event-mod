var fs = require('fs');
var cp = require('child_process');

test.each([
  ['click', 'js'],
  ['type', 'ts'],
])(
  '%s',
  async (sandbox, extension) => {
    const input = `./sandbox/${sandbox}/input.${extension}`;
    const output = `./sandbox/${sandbox}/output.${extension}`;
    const transformed = `./sandbox/${sandbox}/transformed.${extension}`;

    fs.copyFileSync(input, transformed);

    await npm(['run sandbox', '"./sandbox/**/(?!input|output)*{.ts,.js}"']);

    const transformedContent = fs.readFileSync(transformed, 'utf8');
    const expectedContent = fs.readFileSync(output, 'utf8');
    expect(transformedContent).toBe(expectedContent);
  },
  30_000
);

function npm(args) {
  return exec('npm', args);
}

function exec(command, args) {
  return new Promise((resolve, reject) => {
    cp.exec(command + ' ' + args.join(' '), (err, stdout) => {
      if (err) {
        return reject(err);
      }

      resolve(stdout.toString());
    });
  });
}
