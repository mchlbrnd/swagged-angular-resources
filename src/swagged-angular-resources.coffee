#!/usr/bin/env coffee

fs = require "fs"
request = require "request"
path = require "path"
url = require "url"
_ = require "underscore"
_.str = require "underscore.string"
handlebars = require "handlebars"
argv = require("yargs").argv
mkdirp = require "mkdirp"
beautify = require("js-beautify").js_beautify

if argv._.length == 0
  throw "Expected: swagged-angular-resources swagger-docs-url|swagger-docs-file [--ngmodule swaggedAngularResources [--strip-trailing-slashes false [--output index.js [--mock-output false]]]]"

fileOrUrl = argv._[0]
ngModule = argv.ngModule || "swaggedAngularResources"
ngModuleOutput = argv.output || "index.js"
ngDoc = !!argv.ngdoc
ngMockModuleOutput = argv.mock

log = () -> console.log.apply this, arguments

registerHelpers = (fns) ->
  candidateHelpers = _.filter(_.keys(fns), (fnName) -> _.isFunction fns[fnName])
  _.each(candidateHelpers, (fnName) ->
    handlebars.registerHelper(fnName, () ->
      args = Array.prototype.slice.call(arguments, 0).slice(0, -1);
      fns[fnName].apply(this, args);
    )
  )
registerHelpers _.str
handlebars.registerHelper 'json', (context) -> JSON.stringify context, null, 4

registerPartialFromFile = (name, path) ->
  content = fs.readFileSync(path, {encoding: "utf-8"})
  handlebars.registerPartial(name, content)

templateBase = "#{__dirname}/../templates"
providerTemplate = "#{templateBase}/provider-module.hbs"
mockTemplate = "#{templateBase}/mock-module.hbs"
registerPartialFromFile("header", "#{templateBase}/partials/layout/header.hbs")
registerPartialFromFile("footer", "#{templateBase}/partials/layout/footer.hbs")
registerPartialFromFile("provider", "#{templateBase}/partials/provider/provider.hbs")
registerPartialFromFile("providerDoc", "#{templateBase}/partials/provider/provider-doc.hbs")
registerPartialFromFile("providerActions", "#{templateBase}/partials/provider/actions.hbs")
registerPartialFromFile("providerActionsDoc", "#{templateBase}/partials/provider/actions-doc.hbs")
registerPartialFromFile("mockActions", "#{templateBase}/partials/mock/actions.hbs")
registerPartialFromFile("swaggerConfiguration", "#{templateBase}/partials/config/configuration.hbs")
registerPartialFromFile("swaggerInformation", "#{templateBase}/partials/config/information.hbs")

readUrlAsJSON = (url, cb) -> request.get({url: url.href, json: true}, (error, res, result) -> cb(error, result))
readFileAsJSON = (file, cb) -> fs.readFile(file, {encoding: "utf-8"}, (error, file) -> cb(error, JSON.parse(file)))

getParameters = (type, parameters) ->
  params = _.filter(parameters, (parameter) -> parameter.in == type)
  if params.length == 0 then false else params

getResourceOperations = (apiDefinition) ->
  if apiDefinition.tags
    tags = _.map apiDefinition.tags, (tag) -> tag.name
  else
    tags = _.reduce apiDefinition.paths, (memo, methods) ->
      _.each methods, (operation) ->
        memo = memo.concat(operation.tags)
      memo
    , []
    tags = _.uniq tags

  _.reduce apiDefinition.paths, (memo, methods, path) ->
    _.each methods, (operation, action) ->
      inTags = _.intersection operation.tags, tags

      _.each inTags, (tag) ->
        response = operation.responses["200"]
        if response and response.schema
          if response.schema.type == "array"
            modelDefinition = response.schema.items.$ref;
            isQuery = true
          else
            modelDefinition = response.schema.$ref

        # TODO: add parameter for mimeType
        mockedResponseMimeType = "application/json"
        mockedResponse = response.examples[mockedResponseMimeType] if response and response.examples and response.examples[mockedResponseMimeType]

        modelDefinition = modelDefinition and modelDefinition.match(/.+\/(.+)$/)[1]
        memo[tag] = memo[tag] or []
        memo[tag].push {
          path: path.replace(/\{(.+?)\}/g, ":$1")
          nickname: operation.operationId || modelDefinition + "_" + _.str.capitalize(action)
          action: action.toUpperCase()
          summary: operation.summary

          # mock example data
          mockedResponse: mockedResponse

          # build path parameters
          pathParameters: getParameters("path", operation.parameters)

          # get actions
          isQuery: isQuery and action == "get"
          isGet: !isQuery and action == "get"

          # non-get actions
          isDelete: action == "delete"
          isPost: action == "post"
          isPut: action == "put"
          isPatch: action == "patch"
        }
    memo
  , {}

getCode = (error, apiDefinition) ->
  throw error if error

  resourceOperations = getResourceOperations(apiDefinition)

  context = {
    swaggerApiUrl: "#{_.first(apiDefinition.schemes)}://#{apiDefinition.host}#{apiDefinition.basePath}"
    swaggerApiInfo: apiDefinition.info
    ngModule: ngModule
    ngProviderSuffix: ""
    ngResources: resourceOperations
    ngDoc: ngDoc
  }

  # TODO encoding options and write readWrite function
  fs.readFile(providerTemplate, {encoding: "utf-8"}, (error, template) ->
    if error
      throw error
    else
      code = handlebars.compile(template)(context)
      mkdirp.sync path.dirname(ngModuleOutput) if not fs.existsSync ngModuleOutput

      fs.writeFile(ngModuleOutput, beautify(code), {encoding: "utf-8"}, (error) ->
        if error
          throw error
      )
  )

  if ngMockModuleOutput
    fs.readFile(mockTemplate, {encoding: "utf-8"}, (error, template) ->
      if error
        throw error
      else
        code = handlebars.compile(template)(context)
        mkdirp.sync path.dirname(ngMockModuleOutput) if not fs.existsSync ngMockModuleOutput
        fs.writeFile(ngMockModuleOutput, beautify(code), {encoding: "utf-8"}, (error) ->
          if error
            throw error
        )
    )

apiUrlOrFile = url.parse fileOrUrl

if apiUrlOrFile.protocol != null
  readUrlAsJSON apiUrlOrFile, getCode
else
  readFileAsJSON apiUrlOrFile.path, getCode
