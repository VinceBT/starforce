import * as THREE from 'three'

const JSONLoader = (function () {
  function JSONLoader(manager) {
    if (typeof manager === 'boolean') {
      console.warn('THREE.JSONLoader: showStatus parameter has been removed from constructor.')
      manager = undefined
    }

    this.manager = manager !== undefined ? manager : THREE.DefaultLoadingManager

    this.withCredentials = false
  }

  Object.assign(JSONLoader.prototype, {
    crossOrigin: 'anonymous',

    load: function (url, onLoad, onProgress, onError) {
      const scope = this

      const path = this.path === undefined ? THREE.LoaderUtils.extractUrlBase(url) : this.path

      const loader = new THREE.FileLoader(this.manager)
      loader.setPath(this.path)
      loader.setWithCredentials(this.withCredentials)
      loader.load(
        url,
        function (text) {
          const json = JSON.parse(text)
          const metadata = json.metadata

          if (metadata !== undefined) {
            const type = metadata.type

            if (type !== undefined) {
              if (type.toLowerCase() === 'object') {
                console.error(
                  'THREE.JSONLoader: ' + url + ' should be loaded with THREE.ObjectLoader instead.'
                )
                return
              }
            }
          }

          const object = scope.parse(json, path)
          onLoad(object.geometry, object.materials)
        },
        onProgress,
        onError
      )
    },

    setPath: function (value) {
      this.path = value
      return this
    },

    setResourcePath: function (value) {
      this.resourcePath = value
      return this
    },

    setCrossOrigin: function (value) {
      this.crossOrigin = value
      return this
    },

    parse: (function () {
      function parseModel(json, geometry) {
        function isBitSet(value, position) {
          return value & (1 << position)
        }

        const faces = json.faces,
          vertices = json.vertices,
          normals = json.normals,
          colors = json.colors,
          scale = json.scale

        let i,
          j,
          fi,
          offset,
          zLength,
          colorIndex,
          normalIndex,
          uvIndex,
          materialIndex,
          type,
          isQuad,
          hasMaterial,
          hasFaceVertexUv,
          hasFaceNormal,
          hasFaceVertexNormal,
          hasFaceColor,
          hasFaceVertexColor,
          vertex,
          face,
          faceA,
          faceB,
          hex,
          normal,
          uvLayer,
          uv,
          u,
          v,
          nUvLayers = 0

        if (json.uvs !== undefined) {
          // disregard empty arrays

          for (i = 0; i < json.uvs.length; i++) {
            if (json.uvs[i].length) nUvLayers++
          }

          for (i = 0; i < nUvLayers; i++) {
            geometry.faceVertexUvs[i] = []
          }
        }

        offset = 0
        zLength = vertices.length

        while (offset < zLength) {
          vertex = new THREE.Vector3()

          vertex.x = vertices[offset++] * scale
          vertex.y = vertices[offset++] * scale
          vertex.z = vertices[offset++] * scale

          geometry.vertices.push(vertex)
        }

        offset = 0
        zLength = faces.length

        while (offset < zLength) {
          type = faces[offset++]

          isQuad = isBitSet(type, 0)
          hasMaterial = isBitSet(type, 1)
          hasFaceVertexUv = isBitSet(type, 3)
          hasFaceNormal = isBitSet(type, 4)
          hasFaceVertexNormal = isBitSet(type, 5)
          hasFaceColor = isBitSet(type, 6)
          hasFaceVertexColor = isBitSet(type, 7)

          // console.log("type", type, "bits", isQuad, hasMaterial, hasFaceVertexUv, hasFaceNormal, hasFaceVertexNormal, hasFaceColor, hasFaceVertexColor);

          if (isQuad) {
            faceA = new THREE.Face3()
            faceA.a = faces[offset]
            faceA.b = faces[offset + 1]
            faceA.c = faces[offset + 3]

            faceB = new THREE.Face3()
            faceB.a = faces[offset + 1]
            faceB.b = faces[offset + 2]
            faceB.c = faces[offset + 3]

            offset += 4

            if (hasMaterial) {
              materialIndex = faces[offset++]
              faceA.materialIndex = materialIndex
              faceB.materialIndex = materialIndex
            }

            // to get face <=> uv index correspondence

            fi = geometry.faces.length

            if (hasFaceVertexUv) {
              for (i = 0; i < nUvLayers; i++) {
                uvLayer = json.uvs[i]

                geometry.faceVertexUvs[i][fi] = []
                geometry.faceVertexUvs[i][fi + 1] = []

                for (j = 0; j < 4; j++) {
                  uvIndex = faces[offset++]

                  u = uvLayer[uvIndex * 2]
                  v = uvLayer[uvIndex * 2 + 1]

                  uv = new THREE.Vector2(u, v)

                  if (j !== 2) geometry.faceVertexUvs[i][fi].push(uv)
                  if (j !== 0) geometry.faceVertexUvs[i][fi + 1].push(uv)
                }
              }
            }

            if (hasFaceNormal) {
              normalIndex = faces[offset++] * 3

              faceA.normal.set(normals[normalIndex++], normals[normalIndex++], normals[normalIndex])

              faceB.normal.copy(faceA.normal)
            }

            if (hasFaceVertexNormal) {
              for (i = 0; i < 4; i++) {
                normalIndex = faces[offset++] * 3

                normal = new THREE.Vector3(
                  normals[normalIndex++],
                  normals[normalIndex++],
                  normals[normalIndex]
                )

                if (i !== 2) faceA.vertexNormals.push(normal)
                if (i !== 0) faceB.vertexNormals.push(normal)
              }
            }

            if (hasFaceColor) {
              colorIndex = faces[offset++]
              hex = colors[colorIndex]

              faceA.color.setHex(hex)
              faceB.color.setHex(hex)
            }

            if (hasFaceVertexColor) {
              for (i = 0; i < 4; i++) {
                colorIndex = faces[offset++]
                hex = colors[colorIndex]

                if (i !== 2) faceA.vertexColors.push(new THREE.Color(hex))
                if (i !== 0) faceB.vertexColors.push(new THREE.Color(hex))
              }
            }

            geometry.faces.push(faceA)
            geometry.faces.push(faceB)
          } else {
            face = new THREE.Face3()
            face.a = faces[offset++]
            face.b = faces[offset++]
            face.c = faces[offset++]

            if (hasMaterial) {
              materialIndex = faces[offset++]
              face.materialIndex = materialIndex
            }

            // to get face <=> uv index correspondence

            fi = geometry.faces.length

            if (hasFaceVertexUv) {
              for (i = 0; i < nUvLayers; i++) {
                uvLayer = json.uvs[i]

                geometry.faceVertexUvs[i][fi] = []

                for (j = 0; j < 3; j++) {
                  uvIndex = faces[offset++]

                  u = uvLayer[uvIndex * 2]
                  v = uvLayer[uvIndex * 2 + 1]

                  uv = new THREE.Vector2(u, v)

                  geometry.faceVertexUvs[i][fi].push(uv)
                }
              }
            }

            if (hasFaceNormal) {
              normalIndex = faces[offset++] * 3

              face.normal.set(normals[normalIndex++], normals[normalIndex++], normals[normalIndex])
            }

            if (hasFaceVertexNormal) {
              for (i = 0; i < 3; i++) {
                normalIndex = faces[offset++] * 3

                normal = new THREE.Vector3(
                  normals[normalIndex++],
                  normals[normalIndex++],
                  normals[normalIndex]
                )

                face.vertexNormals.push(normal)
              }
            }

            if (hasFaceColor) {
              colorIndex = faces[offset++]
              face.color.setHex(colors[colorIndex])
            }

            if (hasFaceVertexColor) {
              for (i = 0; i < 3; i++) {
                colorIndex = faces[offset++]
                face.vertexColors.push(new THREE.Color(colors[colorIndex]))
              }
            }

            geometry.faces.push(face)
          }
        }
      }

      function parseSkin(json, geometry) {
        const influencesPerVertex =
          json.influencesPerVertex !== undefined ? json.influencesPerVertex : 2

        if (json.skinWeights) {
          for (let i = 0, l = json.skinWeights.length; i < l; i += influencesPerVertex) {
            const x = json.skinWeights[i]
            const y = influencesPerVertex > 1 ? json.skinWeights[i + 1] : 0
            const z = influencesPerVertex > 2 ? json.skinWeights[i + 2] : 0
            const w = influencesPerVertex > 3 ? json.skinWeights[i + 3] : 0

            geometry.skinWeights.push(new THREE.Vector4(x, y, z, w))
          }
        }

        if (json.skinIndices) {
          for (let i = 0, l = json.skinIndices.length; i < l; i += influencesPerVertex) {
            const a = json.skinIndices[i]
            const b = influencesPerVertex > 1 ? json.skinIndices[i + 1] : 0
            const c = influencesPerVertex > 2 ? json.skinIndices[i + 2] : 0
            const d = influencesPerVertex > 3 ? json.skinIndices[i + 3] : 0

            geometry.skinIndices.push(new THREE.Vector4(a, b, c, d))
          }
        }

        geometry.bones = json.bones

        if (
          geometry.bones &&
          geometry.bones.length > 0 &&
          (geometry.skinWeights.length !== geometry.skinIndices.length ||
            geometry.skinIndices.length !== geometry.vertices.length)
        ) {
          console.warn(
            'When skinning, number of vertices (' +
              geometry.vertices.length +
              '), skinIndices (' +
              geometry.skinIndices.length +
              '), and skinWeights (' +
              geometry.skinWeights.length +
              ') should match.'
          )
        }
      }

      function parseMorphing(json, geometry) {
        const scale = json.scale

        if (json.morphTargets !== undefined) {
          for (let i = 0, l = json.morphTargets.length; i < l; i++) {
            geometry.morphTargets[i] = {}
            geometry.morphTargets[i].name = json.morphTargets[i].name
            geometry.morphTargets[i].vertices = []

            const dstVertices = geometry.morphTargets[i].vertices
            const srcVertices = json.morphTargets[i].vertices

            for (let v = 0, vl = srcVertices.length; v < vl; v += 3) {
              const vertex = new THREE.Vector3()
              vertex.x = srcVertices[v] * scale
              vertex.y = srcVertices[v + 1] * scale
              vertex.z = srcVertices[v + 2] * scale

              dstVertices.push(vertex)
            }
          }
        }

        if (json.morphColors !== undefined && json.morphColors.length > 0) {
          console.warn(
            'THREE.JSONLoader: "morphColors" no longer supported. Using them as face colors.'
          )

          const faces = geometry.faces
          const morphColors = json.morphColors[0].colors

          for (let i = 0, l = faces.length; i < l; i++) {
            faces[i].color.fromArray(morphColors, i * 3)
          }
        }
      }

      function parseAnimations(json, geometry) {
        let outputAnimations = []

        // parse old style Bone/Hierarchy animations
        let animations = []

        if (json.animation !== undefined) {
          animations.push(json.animation)
        }

        if (json.animations !== undefined) {
          if (json.animations.length) {
            animations = animations.concat(json.animations)
          } else {
            animations.push(json.animations)
          }
        }

        for (let i = 0; i < animations.length; i++) {
          const clip = THREE.AnimationClip.parseAnimation(animations[i], geometry.bones)
          if (clip) outputAnimations.push(clip)
        }

        // parse implicit morph animations
        if (geometry.morphTargets) {
          // TODO: Figure out what an appropraite FPS is for morph target animations -- defaulting to 10, but really it is completely arbitrary.
          const morphAnimationClips = THREE.AnimationClip.CreateClipsFromMorphTargetSequences(
            geometry.morphTargets,
            10
          )
          outputAnimations = outputAnimations.concat(morphAnimationClips)
        }

        if (outputAnimations.length > 0) geometry.animations = outputAnimations
      }

      return function parse(json, path) {
        if (json.data !== undefined) {
          // Geometry 4.0 spec
          json = json.data
        }

        if (json.scale !== undefined) {
          json.scale = 1.0 / json.scale
        } else {
          json.scale = 1.0
        }

        const geometry = new THREE.Geometry()

        parseModel(json, geometry)
        parseSkin(json, geometry)
        parseMorphing(json, geometry)
        parseAnimations(json, geometry)

        geometry.computeFaceNormals()
        geometry.computeBoundingSphere()

        if (json.materials === undefined || json.materials.length === 0) {
          return { geometry: geometry }
        } else {
          const materials = THREE.Loader.prototype.initMaterials(
            json.materials,
            this.resourcePath || path,
            this.crossOrigin
          )

          return { geometry: geometry, materials: materials }
        }
      }
    })(),
  })

  return JSONLoader
})()

export default JSONLoader
