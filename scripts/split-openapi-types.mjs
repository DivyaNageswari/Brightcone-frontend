import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const schemaPath = 'src/api/schema.d.ts'
const sourceText = fs.readFileSync(schemaPath, 'utf8')
const sourceFile = ts.createSourceFile(schemaPath, sourceText, ts.ScriptTarget.Latest, true)
const operations = sourceFile.statements.find(
  (statement) => ts.isInterfaceDeclaration(statement) && statement.name.text === 'operations',
)

if (!operations) {
  throw new Error('Generated OpenAPI operations interface was not found.')
}

const members = operations.members.map((member) =>
  sourceText.slice(member.getStart(sourceFile), member.end),
)
const groups = []
let currentGroup = []
let currentLineCount = 2

for (const member of members) {
  const memberLineCount = member.split(/\r?\n/).length + 1
  if (currentGroup.length > 0 && currentLineCount + memberLineCount > 300) {
    groups.push(currentGroup)
    currentGroup = []
    currentLineCount = 2
  }
  currentGroup.push(member)
  currentLineCount += memberLineCount
}

if (currentGroup.length > 0) groups.push(currentGroup)

const modulesDirectory = 'src/api/schema'
fs.mkdirSync(modulesDirectory, { recursive: true })
for (const name of fs.readdirSync(modulesDirectory)) {
  if (/^operations-\d+\.d\.ts$/.test(name)) {
    fs.unlinkSync(path.join(modulesDirectory, name))
  }
}
const imports = []

groups.forEach((group, index) => {
  const interfaceName = `OperationGroup${index + 1}`
  const membersText = group
    .map((member) =>
      member
        .split(/\r?\n/)
        .map((line) => `  ${line}`)
        .join('\n'),
    )
    .join('\n')
  const modulePath = path.join(modulesDirectory, `operations-${index + 1}.d.ts`)

  fs.writeFileSync(
    modulePath,
    `import type { components } from '../schema'\n\n` +
      `export interface ${interfaceName} {\n${membersText}\n}\n`,
  )
  imports.push(`import type { ${interfaceName} } from './schema/operations-${index + 1}'`)
})

const start = operations.getStart(sourceFile)
const updatedSchema =
  sourceText.slice(0, start) +
  `export interface operations extends ${groups.map((_, index) => `OperationGroup${index + 1}`).join(', ')} {}` +
  sourceText.slice(operations.end)
const exportIndex = updatedSchema.indexOf('export interface paths')

if (exportIndex < 0) {
  throw new Error('Generated OpenAPI paths interface was not found.')
}

fs.writeFileSync(
  schemaPath,
  updatedSchema.slice(0, exportIndex) +
    imports.join('\n') +
    '\n\n' +
    updatedSchema.slice(exportIndex),
)
