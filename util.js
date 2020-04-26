class Util {

   static bgElement;
   static background;
   static alElement;
   static activeLayer;
   static playground;
   static events = {};

   static setup(background, activeLayer) {
      Util.bgElement   = background;
      Util.background  = background.getContext("2d");
      Util.alElement   = activeLayer;
      Util.activeLayer = activeLayer.getContext("2d");
   }

   static hflip(variant) {
      let k = [];
      for (let r of variant) {
         k.push([...r]);
      }
      for (let r of k) {
         r = r.reverse();
      }
      return k;
  }

  static vflip(variant) {
      let v = [...variant];
      let r = [];
      for (let i = 0; i < variant.length; i++) {
          r.push(v.pop());
      }
      return r;
  }

   /* line
   * warpper for canvas of drawing a line
   * @param start:  int array[2] start point of the line
   * @param end:    int array[2] end point of the liine
   * @param width:  int width of the line
   * @param stroke: string stroke color of the line
   */
   static line(start, end, width = 1, stroke = 'black', ctx = Util.background) {
      ctx.beginPath();
      ctx.moveTo(start[0], start[1]);
      ctx.lineTo(end[0], end[1]);
      ctx.closePath();
      ctx.strokeStyle = stroke;
      ctx.lineWidth = width;
      ctx.stroke();
   }

   /** toExactCoord
    * transform a coordinate array to grid coordinates
    * @param {array} location 
    */
   static toExactCoord(location) {
      let r = [...location];
      r[0] *= GRID_SIZE;
      r[1] *= GRID_SIZE;
      return r;
   }

   static toGridCoord(location) {
      let r = [...location];
      r[0] = Math.floor(r[0] / GRID_SIZE);
      r[1] = Math.floor(r[1] / GRID_SIZE);
      r[0] = r[0] >= GRID_NUM ? GRID_NUM - 1 : r[0] < 0 ? 0 : r[0];
      r[1] = r[1] >= GRID_NUM ? GRID_NUM - 1 : r[1] < 0 ? 0 : r[1];
      return r;
   }

   /* square
   * draw a square at some location
   * @param size:     int size of the cube
   * @param location: int array[2] location to draw the square
   * @param fill:     string color of the fill
   */
   static square(size, location, fill, ctx = Util.background) {
      Util.rect(size, size, location, fill, ctx);
   }

   static rect(width, height, location, fill, ctx = Util.background) {
      ctx.fillStyle = fill;
      ctx.fillRect(
         location[0],
         location[1], width, height);
   }

   static clearActiveLayer() {
      Util.clearRect(
         Util.alElement.width, 
         Util.alElement.height, 
         [0, 0], 
         Util.activeLayer);
   }

   static clearRect(width, length, location, ctx = Util.background) {
      ctx.clearRect(location[0], location[1], width, length);
   }

   static circle(size, location, fill, ctx = Util.background) {
      ctx.fillStyle = fill;
      ctx.beginPath();
      ctx.arc(location[0], location[1], size, 0, Math.PI * 2);
      ctx.closePath();
      ctx.fill();
   }

   static degToRad(deg) {
      return deg / 360 * (Math.PI * 2);
   }

   static radToDeg(rad) {
      return rad / (Math.PI * 2) * 360;
   }

   static distance(a, b) {
      // console.log("Distance is: ", Math.sqrt((a[0] - b[0])**2 + (a[1] - b[1])**2));
      return Math.sqrt((a[0] - b[0])**2 + (a[1] - b[1])**2);
   }

   static atAngle(origin, target) {
      // console.log("Object is at: ", Math.atan((origin[0] - target[0])/(origin[1] - target[1])));
      return Math.atan((origin[0] - target[0])/(origin[1] - target[1]));
   }

   static angleFromArc(radius, arcLength) {
      // console.log("Angle from arc is: ", arcLength / radius);
      return arcLength / radius;
   }

   static paddingNum(num) {
      return ((""+num).length) < 2? "0" + num : num;
   }

   static getHostId(location) {
      return "" + Util.paddingNum(location[0])
                + Util.paddingNum(location[1]);
   }
}
