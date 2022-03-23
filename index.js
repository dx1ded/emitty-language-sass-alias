const path = require('path')
const parser = require('scss-symbols-parser')

function parse(aliases, filepath, buffer) {
  let data = buffer.toString()

	// Replace all the aliases to normal path
	// ---------------------------------------

  Object.entries(aliases).forEach(([aliasName, aliasPath]) => {
    const relativePath = path.relative(
      path.dirname(filepath),
      aliasPath
    )

    data = data.replaceAll(aliasName, relativePath)
  })

	// ---------------------------------------

	const symbols = parser.parseSymbols(data)
	const references = symbols.imports.reduce((collection, symbol) => {
		if (hasExtension(symbol.filepath)) {
			collection.push(...[
				symbol.filepath,
				formatPartialImport(symbol.filepath)
			])
		} else {
			collection.push(...[
				`${symbol.filepath}.sass`,
				`${symbol.filepath}.scss`,

				// https://sass-lang.com/documentation/at-rules/import#index-files
				`${symbol.filepath}/_index.sass`,
				`${symbol.filepath}/_index.scss`,

				// https://sass-lang.com/documentation/at-rules/import#partials
				formatPartialImport(symbol.filepath, '.sass'),
				formatPartialImport(symbol.filepath, '.scss')
			])
		}

		return collection
	}, [])

	return Promise.resolve({ references })
}

function hasExtension(filepath) {
	return path.extname(filepath) !== ''
}

function formatPartialImport(filepath, extension = '') {
	const directory = path.dirname(filepath)
	const name = path.basename(filepath)

	const prefix = directory === '.' ? '' : `${directory}/`

	return `${prefix}_${name}${extension}`
}

exports.parse = parse
