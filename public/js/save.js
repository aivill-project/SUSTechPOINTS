import { Editor } from './editor.js'
import { ImageContextManager } from './image.js'
import { logger } from './log.js'

function reloadWorldList(worldList, done) {
  var xhr = new XMLHttpRequest()
  // we defined the xhr
  xhr.onreadystatechange = function () {
    if (this.readyState != 4) return

    if (this.status == 200) {
      let anns = JSON.parse(this.responseText)

      // load annotations
      anns.forEach(a => {
        let world = worldList.find(w => {
          return w.frameInfo.scene == a.scene && w.frameInfo.frame == a.frame
        })
        if (world) {
          world.annotation.reapplyAnnotation(a.annotation)
        } else {
          console.error('bug?')
        }
      })

      if (done) done()
    }
  }

  xhr.open('POST', '/loadworldlist', true)

  let para = worldList.map(w => {
    return {
      //todo: we could add an id, so as to associate world easily
      scene: w.frameInfo.scene,
      frame: w.frameInfo.frame,
    }
  })

  xhr.send(JSON.stringify(para))
}

var saveDelayTimer = null
var pendingSaveList = []

function saveWorldList(worldList) {
  pendingSaveList = pendingSaveList.concat(worldList)

  if (saveDelayTimer) {
    clearTimeout(saveDelayTimer)
  }

  saveDelayTimer = setTimeout(
    () => {
      logger.log('save delay expired.')

      doSaveWorldList(pendingSaveList, () => {
        editor.header.updateModifiedStatus()
      })

      //reset

      saveDelayTimer = null
      pendingSaveList = []
    },

    100
  )
}

function reorder_points(pts) {
  const sorted = pts.sort((pt1, pt2) => pt1.x - pt2.x)
  const ptl = sorted.slice(0, 2).sort((pt1, pt2) => pt1.y - pt2.y)
  const ptr = sorted.slice(2).sort((pt1, pt2) => pt1.y - pt2.y)
  const newPts = [ptl[0], ptr[0], ptr[1], ptl[1]]
  return newPts
}

function save2DAnnotation() {
  var wrappers = document.getElementsByClassName('image-wrapper')
  for (var i = 0; i < wrappers.length; i++) {
    var header = wrappers[i].getElementsByTagName('header')[0]
    var svg = wrappers[i].getElementsByTagName('svg')[0]
    var img = svg.getElementById('svg-image')
    var boxes = svg.getElementById('svg-boxes')
    var cuboids = boxes.children
    var objects = []
    for (let i = 0; i < cuboids.length; i++) {
      var cls = cuboids[i].getAttribute('class').split(' ')[0]
      var nid = cuboids[i].getAttribute('id').split('-')[3]
      var object = {}
      object['id'] = parseInt(nid)
      object['class'] = cls
      var polygon = null
      var lines = []
      for (let j = 0; j < cuboids[i].children.length; j++) {
        let e = cuboids[i].children[j]
        if (e.tagName === 'polygon') {
          let pts = e.getAttribute('points').split(',')
          polygon = [
            { x: parseInt(pts[0]), y: parseInt(pts[1]) },
            { x: parseInt(pts[2]), y: parseInt(pts[3]) },
            { x: parseInt(pts[4]), y: parseInt(pts[5]) },
            { x: parseInt(pts[6]), y: parseInt(pts[7]) },
          ]
          continue
        }
        if (e.tagName === 'line') {
          lines.push({
            x: parseInt(e.getAttribute('x1')),
            y: parseInt(e.getAttribute('y1')),
          })
          lines.push({
            x: parseInt(e.getAttribute('x2')),
            y: parseInt(e.getAttribute('y2')),
          })
          continue
        }
      }
      let back = lines.slice(0, 8)
      object['front'] = reorder_points(polygon)
      object['back'] = reorder_points([back[0], back[2], back[4], back[6]])
      objects.push(object)
    }
    // console.log(header.innerText, img, boxes.children)
    var jsonObject = {
      filename: img.getAttribute('xlink:href').split('/').pop(),
      width: parseInt(img.getAttribute('width')),
      height: parseInt(img.getAttribute('height')),
      objects: objects,
    }

    var xhr = new XMLHttpRequest()
    xhr.open('POST', '/save2DAnnotation', true)
    xhr.setRequestHeader('Content-Type', 'application/json')

    xhr.onreadystatechange = function () {
      if (this.readyState != 4) return

      if (this.status == 200) {
        //
      } else {
        //
      }

      // end of state change: it can be after some time (async)
    }

    var fi = window.editor.data.worldList.find(w => w.active).frameInfo
    var b = JSON.stringify({
      scene: fi.scene,
      frame: fi.frame,
      location: header.innerText,
      annotation: jsonObject,
    })
    xhr.send(b)
  }
}

function doSaveWorldList(worldList, done) {
  if (worldList.length > 0) {
    if (worldList[0].data.cfg.disableLabels) {
      console.log('labels not loaded, save action is prohibitted.')
      return
    }
  }

  console.log(worldList.length, 'frames')
  let ann = worldList.map(w => {
    return {
      scene: w.frameInfo.scene,
      frame: w.frameInfo.frame,
      annotation: w.annotation.toBoxAnnotations(),
    }
  })

  var xhr = new XMLHttpRequest()
  xhr.open('POST', '/saveworldlist', true)
  xhr.setRequestHeader('Content-Type', 'application/json')

  xhr.onreadystatechange = function () {
    if (this.readyState != 4) return

    if (this.status == 200) {
      worldList.forEach(w => {
        w.annotation.resetModified()
      })

      logger.log(`saved: ${worldList[0].frameInfo.scene}: ${worldList.reduce((a, b) => a + ' ' + b.frameInfo.frame, '')}`)

      if (done) {
        done()
      }
    } else {
      window.editor.infoBox.show('Error', `save failed, status : ${this.status}`)
    }

    // end of state change: it can be after some time (async)
  }

  var b = JSON.stringify(ann)
  //console.log(b);
  xhr.send(b)

  save2DAnnotation()
}

// function saveWorld(world, done){
//     if (world.data.cfg.disableLabels){
//         logger.log("labels not loaded, save action is prohibitted.")
//         return;
//     }

//     console.log(world.annotation.boxes.length, "boxes");
//     let bbox_annotations = world.annotation.toBoxAnnotations();

//     var xhr = new XMLHttpRequest();
//     xhr.open("POST", "/saveworld" +"?scene="+world.frameInfo.scene+"&frame="+world.frameInfo.frame, true);
//     xhr.setRequestHeader('Content-Type', 'application/json');

//     xhr.onreadystatechange = function () {
//         if (this.readyState != 4) return;

//         if (this.status == 200) {
//             logger.log(`saved: ${world}`);
//             world.annotation.resetModified();

//             //reload obj-ids of the scene
//             //todo: this shall be moved to done
//             //load_obj_ids_of_scene(world.frameInfo.scene);

//             if(done){
//                 done();
//             }

//         }

//         // end of state change: it can be after some time (async)
//     };

//     var b = JSON.stringify(bbox_annotations);
//     //console.log(b);
//     xhr.send(b);
// }

export { saveWorldList, reloadWorldList }
