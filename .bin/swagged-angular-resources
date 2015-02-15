#!/usr/bin/env coffee

fs = require "fs"
request = require "request"
url = require "url"
_ = require "underscore"
_.str = require "underscore.string"
handlebars = require "handlebars"

if process.argv.length < 3
  throw "Expected: swagged-angular-resources <swagger-docs-url|swagger-docs-file>"

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

      if modelDefinition
        modelDefinition = modelDefinition.match(/.+\/(.+)$/)[1]
        memo[modelDefinition] = memo[modelDefinition] || []

        memo[modelDefinition].push({
          path: path.replace(/\{(.+)\}/g, ":$1")
          nickname: operation.operationId
          action: action.toUpperCase()

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
    angularProviderType: "provider"
    angularProviderSuffix: ""
    resourceOperations: resourceOperations
  }

  fs.readFile("#{__dirname}/../templates/swagged-angular-resources-provider.hbs", {encoding: "utf-8"}, (error, template) ->
    if error
      throw error
    else
      log handlebars.compile(template)(context)
  )

apiUrlOrFile = url.parse process.argv[2]

if apiUrlOrFile.protocol != null
  readUrlAsJSON apiUrlOrFile, getCode
else
  readFileAsJSON apiUrlOrFile.path, getCode
