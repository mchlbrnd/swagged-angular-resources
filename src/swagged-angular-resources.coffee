#!/usr/bin/env coffee

fs = require "fs"
request = require "request"
url = require "url"
_ = require "underscore"
_.str = require "underscore.string"
handlebars = require "handlebars"
argv = require("yargs").argv

if argv._.length == 0
  throw "Expected: swagged-angular-resources swagger-docs-url|swagger-docs-file [--ngmodule swaggedAngularResources [--strip-trailing-slashes false [--output index.js [--mock-output false]]]]"

providerTemplate = "#{__dirname}/../templates/resource-providers.hbs"
mockTemplate = "#{__dirname}/../templates/httpBackend-mocks.hbs"

fileOrUrl = argv._[0]
ngModule = argv.ngModule || "swaggedAngularResources"
ngModuleOutput = argv.output || "index.js"
stripTrailingSlashes = !!argv.stripTrailingSlashes
ngdoc = !!argv.ngdoc
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
registerHelpers(_.str)

readUrlAsJSON = (url, cb) -> request.get({url: url.href, json: true}, (error, res, result) -> cb(error, result))
readFileAsJSON = (file, cb) -> fs.readFile(file, {encoding: "utf-8"}, (error, file) -> cb(error, JSON.parse(file)))

getParameters = (type, parameters) ->
  params = _.filter(parameters, (parameter) -> parameter.in == type)
  if params.length == 0 then false else params

getResourceOperations = (apiDefinition) ->
  _.reduce(apiDefinition.paths, (memo, methods, path) ->
    _.each(methods, (operation, action) ->
      response = operation.responses["200"]
      if response and response.schema
        if response.schema.type == "array"
          modelDefinition = response.schema.items.$ref;
          isQuery = true
        else
          modelDefinition = response.schema.$ref

      # TODO: add parameter for mimeType
      mockedResponseMimeType = "application/json"
      mockedResponse = JSON.stringify(response.examples[mockedResponseMimeType], null, 4) if response.examples and response.examples[mockedResponseMimeType]

      if modelDefinition
        modelDefinition = modelDefinition.match(/.+\/(.+)$/)[1]
        memo[modelDefinition] = memo[modelDefinition] || []

        memo[modelDefinition].push({
          path: path.replace(/\{(.+)\}/g, ":$1")
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
        })
    )
    memo
  , {})

getCode = (error, apiDefinition) ->
  throw error if error

  resourceOperations = getResourceOperations(apiDefinition)

  context = {
    ngModule: ngModule
    angularProviderType: "provider"
    angularProviderSuffix: ""
    stripTrailingSlashes: stripTrailingSlashes
    resourceOperations: resourceOperations
    ngdoc: ngdoc
  }

  # TODO encoding options and write readWrite function
  fs.readFile(providerTemplate, {encoding: "utf-8"}, (error, template) ->
    if error
      throw error
    else
      code = handlebars.compile(template)(context)
      fs.writeFile(ngModuleOutput, code, {encoding: "utf-8"}, (error) ->
        if error
          throw error
      )
  )

  if ngMockModuleOutput
    fs.readFile(mockTemplate, {encoding: "utf-8"}, (error, template) ->
      if error
        throw error
      else
        log ngMockModuleOutput
        code = handlebars.compile(template)(context)
        fs.writeFile(ngMockModuleOutput, code, {encoding: "utf-8"}, (error) ->
          if error
            throw error
        )
    )

apiUrlOrFile = url.parse fileOrUrl

if apiUrlOrFile.protocol != null
  readUrlAsJSON apiUrlOrFile, getCode
else
  readFileAsJSON apiUrlOrFile.path, getCode
