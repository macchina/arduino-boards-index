const Octokat = require('octokat');
const octo = new Octokat();

const Ajv = require('ajv');
const ajv = new Ajv();
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-04.json'));

const fs = require('fs');
const { promisify } = require('util');

const publishingRepositories = [
  "adamvoss/Macchina_Arduino_Boards"
]

function createRepo(qualifiedRepoName) {
  const pieces = qualifiedRepoName.split('/');
  return octo.repos(pieces[0], pieces[1]);
}

async function main() {

  // We validate against a schema as a security measure against injection attacks  
  const schema = JSON.parse(await promisify(fs.readFile)('release.schema.json', 'utf8'));

  for (repository of publishingRepositories) {
    const repo = createRepo(repository);
    const releases = await repo.releases.fetchAll();

    for (release of releases) {
      const releaseInfo = JSON.parse(release.body)

      const isValid = ajv.validate(schema, releaseInfo);
      if (!isValid) {
        throw new Error(`Not a valid release. ${ajv.errorsText()}`);
      }


    }
  }
}

if (require.main === module) {
  main(process.argv)
    .then(s => console.log(s))
    .catch(error => {
      console.error(error);
      process.exit(2);
    });
}

const index = {
  packages: [
    {
      name: "macchina",
      maintainer: "Macchina",
      websiteURL: "https://www.macchina.cc",
      email: "info@macchina.cc",
      help: {
        online: "https://forum.macchina.cc/"
      },
      platforms: [
        {
          name: "Macchina SAM Boards (dependency: Arduino SAM Boards)",
          architecture: "sam",
          version: "0.0.0",
          category: "Contributed",
          url: "https://github.com/adamvoss/Macchina_Arduino_Boards/releases/download/0.0.0/macchina-sam-0.0.0.tar.gz",
          archiveFileName: "macchina-sam-0.0.0.tar.gz",
          checksum: "SHA-256:0f5a4f5a08400cfd0fd00fd2f88db8bbfed5b879e3c9e6e93dbb08c23754e198",
          size: "52586",
          boards: [
            {
              name: "Macchina M2"
            }
          ],
          toolsDependencies: [
            {
              packager: "arduino",
              name: "arm-none-eabi-gcc",
              version: "4.8.3-2014q1"
            },
            {
              packager: "arduino",
              name: "bossac",
              version: "1.6.1-arduino"
            }
          ]
        }
      ],
      tools: []
    }
  ]
}