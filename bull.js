function run() {
    var count = "42";
    var countup = 0;
    var countup2 = 0;
    var groundLVL = 300;
    var triarray = new Array();
    var pointarray = new Array();
    var bonearray = new Array();
    var friction = 0.7;

    function coord(xpos, ypos) {
        this.px = xpos;
        this.py = ypos;
    }

    function bone(bonelength, nx, ny, rotation) {
        this.leng = bonelength;
        this.cx = nx; //current x&y
        this.cy = ny;
        this.ox = nx; //old y&y
        this.oy = ny;
        this.rot = rotation; //rotation and old rotation
        this.orot = rotation;
        this.slaveP = new Array();
        bonearray.push(this);
        this.getpin = getpin;

        function getpin() {
            var angle = this.rot * Math.PI / 180;
            var xPos = this.cx + Math.cos(angle) * this.leng;
            var yPos = this.cy + Math.sin(angle) * this.leng;
            return new coord(xPos, yPos);
        }
    } //end of bone
    function point(nx, ny, sp) {
        this.tx = nx;
        this.ty = ny;
        this.cx = nx;
        this.cy = ny;
        this.vx = 0;
        this.vy = 0;
        this.spring = sp;
        pointarray.push(this);
    }

    function tri(pa, pb, pc, clr, alpha) {
        this.point1 = pa;
        this.point2 = pb;
        this.point3 = pc;
        this.colour = clr;
        this.a = alpha;
        triarray.push(this);
    }

    function matrixMULT(matrixA, matrixB) {
        var result = new Array();
        result[0] = matrixA[0] * matrixB[0][0] +
            matrixA[1] * matrixB[1][0] +
            matrixA[2] * matrixB[2][0] +
            matrixA[3] * matrixB[3][0];
        result[1] = matrixA[0] * matrixB[0][1] +
            matrixA[1] * matrixB[1][1] +
            matrixA[2] * matrixB[2][1] +
            matrixA[3] * matrixB[3][1];
        result[2] = matrixA[0] * matrixB[0][2] +
            matrixA[1] * matrixB[1][2] +
            matrixA[2] * matrixB[2][2] +
            matrixA[3] * matrixB[3][2];
        result[3] = matrixA[0] * matrixB[0][3] +
            matrixA[1] * matrixB[1][3] +
            matrixA[2] * matrixB[2][3] +
            matrixA[3] * matrixB[3][3];
        return result;
    }

    function applyTRANSFORM(cBONE) {
        var tx = cBONE.cx - cBONE.ox;
        var ty = cBONE.cy - cBONE.oy;
        var tz = 0;
        var Crotation = cBONE.rot;
        Crotation = (Math.abs(Crotation) > 360) ? (Crotation < 0) ? Crotation % 360 + 360 : Crotation % 360 : Crotation;
        cBONE.orot = (Math.abs(cBONE.orot) > 360) ? (cBONE.orot < 0) ? cBONE.orot % 360 + 360 : cBONE.orot % 360 : cBONE.orot;
        var Drotation = Crotation - cBONE.orot;
        var angleX = Drotation * (Math.PI / 180); // difffrence between old rot and current rot
        var sin = Math.sin(angleX);
        var cos = Math.cos(angleX);
        var xyTransMatrix = new Array();
        var invTransMatrix = new Array();
        var zRotMatrix = new Array();
        zRotMatrix[0] = [cos, sin, 0, 0];
        zRotMatrix[1] = [-sin, cos, 0, 0];
        zRotMatrix[2] = [0, 0, 1, 0];
        zRotMatrix[3] = [0, 0, 0, 1];
        for (var i = 0; i < cBONE.slaveP.length; i++) {
            var position = [cBONE.slaveP[i].tx, cBONE.slaveP[i].ty, 50, 1];
            xyTransMatrix[0] = [1, 0, 0, 0];
            xyTransMatrix[1] = [0, 1, 0, 0];
            xyTransMatrix[2] = [0, 0, 1, 0];
            xyTransMatrix[3] = [tx, ty, tz, 1];
            var result = matrixMULT(position, xyTransMatrix);
            cBONE.slaveP[i].tx = result[0];
            cBONE.slaveP[i].ty = result[1];
        } // end for
        tx = cBONE.cx;
        ty = cBONE.cy;
        for (i = 0; i < cBONE.slaveP.length; i++) {
            position = [cBONE.slaveP[i].tx, cBONE.slaveP[i].ty, 50, 1];
            //translate to center
            invTransMatrix[0] = [1, 0, 0, 0];
            invTransMatrix[1] = [0, 1, 0, 0];
            invTransMatrix[2] = [0, 0, 1, 0];
            invTransMatrix[3] = [-tx, -ty, 0, 1];
            result = matrixMULT(position, invTransMatrix);
            cBONE.slaveP[i].tx = result[0];
            cBONE.slaveP[i].ty = result[1];
            //rotate by anglex
            position = [cBONE.slaveP[i].tx, cBONE.slaveP[i].ty, 50, 1];
            result = matrixMULT(position, zRotMatrix);
            cBONE.slaveP[i].tx = result[0];
            cBONE.slaveP[i].ty = result[1];
            //undo translate to center
            position = [cBONE.slaveP[i].tx, cBONE.slaveP[i].ty, 50, 1];
            invTransMatrix[0] = [1, 0, 0, 0];
            invTransMatrix[1] = [0, 1, 0, 0];
            invTransMatrix[2] = [0, 0, 1, 0];
            invTransMatrix[3] = [tx, ty, 0, 1];
            result = matrixMULT(position, invTransMatrix);
            cBONE.slaveP[i].tx = result[0];
            cBONE.slaveP[i].ty = result[1];
        } //end for
        cBONE.ox = cBONE.cx;
        cBONE.oy = cBONE.cy;
        cBONE.orot = cBONE.rot;
    } //end of apply transform;
    function applyKinematics(thigh, shin, targetX, targetY, right) {
        if (targetY >= groundLVL) {
            targetY = groundLVL;
        }
        if (right == true) {
            var dx = targetX - thigh.cx;
            var dy = targetY - thigh.cy;
            var distTOg = Math.sqrt(dx * dx + dy * dy);
            var Lb = thigh.leng;
            var La = shin.leng;
            var Lc = Math.min(distTOg, La + Lb);
            var B = Math.acos((Lb * Lb - La * La - Lc * Lc) / (-2 * La * Lc));
            var C = Math.acos((Lc * Lc - La * La - Lb * Lb) / (-2 * La * Lb));
            var D = Math.atan2(dy, dx);
            var E = D + B + Math.PI + C;
            thigh.rot = E * 180 / Math.PI;
            shin.cx = thigh.getpin().px;
            shin.cy = thigh.getpin().py;
            shin.rot = (D + B) * 180 / Math.PI;
        } else {
            var dx = targetX - thigh.cx;
            var dy = targetY - thigh.cy;
            var distTOg = Math.sqrt(dx * dx + dy * dy);
            var La = thigh.leng;
            var Lb = shin.leng;
            var Lc = Math.min(distTOg, La + Lb);
            var B = Math.acos((Lb * Lb - La * La - Lc * Lc) / (-2 * La * Lc));
            var C = Math.acos((Lc * Lc - La * La - Lb * Lb) / (-2 * La * Lb));
            var D = Math.atan2(dy, dx);
            var E = D + B + Math.PI + C;
            thigh.rot = (D + B) * 180 / Math.PI;
            shin.cx = thigh.getpin().px;
            shin.cy = thigh.getpin().py;
            shin.rot = E * 180 / Math.PI;
        }
    }; //end of apply kinematics
    function jiggleshit(event) {
        var rect = canvas.getBoundingClientRect();
        var cx = event.clientX - rect.left;
        var cy = event.clientY - rect.top;
        for (var i = 0; i < pointarray.length; i++) {
            var ang = Math.atan2(  pointarray[i].cy-cy ,pointarray[i].cx-cx );
            pointarray[i].vx = 120 * Math.cos(ang);
            pointarray[i].vy = 120 * Math.sin(ang);
        };
    };



    //THIS DATA FOR DRAWING THE BULL
    //=============================
    var spine1 = new bone(170, 450, 170, 200);
    var spine2 = new bone(70, spine1.getpin().px, spine1.getpin().py, spine1.rot - 40);
    var neck1 = new bone(70, spine2.getpin().px, spine2.getpin().py, 180);
    var head = new bone(70, neck1.getpin().px, neck1.getpin().py, 105);
    var tail = new bone(50, spine1.cx, spine1.cy, -50);
    var thigh1 = new bone(50, spine1.cx, spine1.cy, 110);
    var shin1 = new bone(80, thigh1.getpin().px, thigh1.getpin().py, 95);
    var thigh2 = new bone(50, spine1.cx, spine1.cy, 80);
    var shin2 = new bone(80, thigh2.getpin().px, thigh2.getpin().py, 80);
    var humerus1 = new bone(110, spine2.getpin().px, spine2.getpin().py, 75);
    var radius1 = new bone(60, humerus1.getpin().px, humerus1.getpin().py, 90);
    var humerus2 = new bone(110, spine2.getpin().px, spine2.getpin().py, 90);
    var radius2 = new bone(60, humerus2.getpin().px, humerus2.getpin().py, 120);
    var pt1 = new point(115, 194.100, 1);
    var pt2 = new point(141, 220.334, 1);
    var pt3 = new point(149, 130.667, 1);
    var pt4 = new point(148.667, 206.667, 1);
    var pt5 = new point(172.667, 199, 1);
    var pt6 = new point(150.333, 143.667, 1);
    var pt7 = new point(160, 140.667, 1);
    var pt8 = new point(159.333, 127.333, 1);
    var pt9 = new point(125.333, 126.667, 1);
    var pt10 = new point(211, 203.667, 1);
    var pt11 = new point(191, 98.667, 1);
    var pt12 = new point(156.667, 121.333, 1);
    var pt14 = new point(216.667, 197.333, 1);
    var pt15 = new point(253, 102.667, 0.6);
    var pt16 = new point(202.667, 97.333, 0.8);
    var pt17 = new point(222.667, 91.333, 1);
    var pt18 = new point(318, 83.667, 0.5);
    var pt19 = new point(263, 66, 0.9);
    var pt20 = new point(260.333, 104, 1);
    var pt21 = new point(335, 99, 0.6);
    var pt22 = new point(262.333, 243.334, 1);
    var pt23 = new point(233.333, 166.667, 1);
    var pt24 = new point(234.333, 233.334, 2);
    var pt25 = new point(280.667, 223.334, 0.8);
    var pt26 = new point(241.667, 162, 0.5);
    var pt27 = new point(211.667, 240.334, 2);
    var pt28 = new point(249.333, 243.667, 0.8);
    var pt29 = new point(228, 182.333, 0.5);
    var pt30 = new point(223.5, 260.5, 0.5);
    var pt31 = new point(234.75, 251.5, 0.5);
    var pt32 = new point(210, 225.75, 2);
    var pt33 = new point(196, 270, 0.5);
    var pt34 = new point(209.5, 266.75, 0.5);
    var pt35 = new point(198.5, 222.75, 2);
    var pt36 = new point(180, 271, 0.5);
    var pt37 = new point(189, 273, 0.5);
    var pt38 = new point(191.75, 219.25, 2);
    var pt39 = new point(216.75, 285, 1);
    var pt40 = new point(230.5, 255.5, 1);
    var pt41 = new point(215, 248.75, 1);
    var pt42 = new point(202.25, 283.75, 1);
    var pt43 = new point(213.75, 284, 1);
    var pt44 = new point(209.75, 249.25, 1);
    var pt45 = new point(189, 298.25, 2);
    var pt46 = new point(208, 293, 2);
    var pt47 = new point(196.5, 288.25, 2);
    var pt48 = new point(247.75, 283.25, 1);
    var pt49 = new point(257.25, 282, 1);
    var pt50 = new point(254.25, 243.25, 1);
    var pt51 = new point(247.5, 303.75, 2);
    var pt52 = new point(257.5, 293.75, 2);
    var pt53 = new point(245.75, 289.25, 2);
    var pt54 = new point(349.75, 251, 1.5);
    var pt55 = new point(458.25, 169.5, 0.6);
    var pt56 = new point(300, 194.5, 0.4);
    var pt57 = new point(418, 228, 1.3);
    var pt58 = new point(444.25, 165, 0.6);
    var pt59 = new point(376.5, 118.5, 0.5);
    var pt60 = new point(460.25, 196, 0.6);
    var pt61 = new point(478, 153.25, 0.7);
    var pt62 = new point(391.5, 144.25, 0.6);
    var pt63 = new point(455, 153.5, 1);
    var pt64 = new point(466, 159, 1);
    var pt65 = new point(504.5, 116, 0.8);
    var pt66 = new point(497.25, 111, 0.7);
    var pt67 = new point(462, 235.75, 2);
    var pt68 = new point(451.75, 171.75, 0.6);
    var pt69 = new point(411.75, 196.75, 0.6);
    var pt70 = new point(431.5, 250.75, 3);
    var pt71 = new point(439.5, 193, 3);
    var pt72 = new point(418.75, 237.5, 3);
    var pt73 = new point(432, 288.5, 3);
    var pt74 = new point(426.75, 253.75, 3);
    var pt75 = new point(402.75, 233, 3);
    var pt76 = new point(468.25, 289.25, 2);
    var pt77 = new point(475.25, 232, 2);
    var pt78 = new point(453.75, 244, 2);
    var pt79 = new point(422.75, 309.5, 3);
    var pt80 = new point(431.5, 297.5, 3);
    var pt81 = new point(421.5, 297.5, 3);
    var pt82 = new point(466.25, 306, 3);
    var pt83 = new point(472.5, 295, 3);
    var pt84 = new point(463.75, 294.25, 3);
    var pt85 = new point(163, 145, 1);
    var pt86 = new point(177, 214, 0.3);
    var pt87 = new point(230, 223, 0.3);
    var tri1 = new tri(pt1, pt2, pt3, 170, 1);
    var tri2 = new tri(pt4, pt5, pt6, 100, 0.7);
    var tri3 = new tri(pt7, pt8, pt9, 10, 0.8);
    var tri4 = new tri(pt10, pt11, pt12, 60, 0.7);
    var tri5 = new tri(pt14, pt15, pt16, 20, 0.7);
    var tri6 = new tri(pt17, pt18, pt19, 40, 0.8);
    var tri7 = new tri(pt20, pt22, pt23, 10, 0.7);
    var tri8 = new tri(pt20, pt21, pt23, 40, 0.8);
    var tri9 = new tri(pt24, pt25, pt26, 20, 0.7);
    var tri10 = new tri(pt27, pt28, pt29, 20, 0.7);
    var tri11 = new tri(pt30, pt31, pt32, 20, 0.3);
    var tri12 = new tri(pt33, pt34, pt35, 30, 0.3);
    var tri13 = new tri(pt36, pt37, pt38, 60, 0.3);
    var tri14 = new tri(pt39, pt40, pt41, 100, 0.7);
    var tri15 = new tri(pt42, pt43, pt44, 100, 0.7);
    var tri16 = new tri(pt45, pt46, pt47, 50, 0.7);
    var tri17 = new tri(pt48, pt49, pt50, 50, 0.7);
    var tri18 = new tri(pt51, pt52, pt53, 50, 0.7);
    var tri19 = new tri(pt54, pt55, pt56, 100, 0.7);
    var tri20 = new tri(pt57, pt58, pt59, 100, 0.7);
    var tri21 = new tri(pt60, pt61, pt62, 100, 1);
    var tri22 = new tri(pt63, pt64, pt66, 50, 1);
    var tri23 = new tri(pt64, pt65, pt66, 50, 1);
    var tri24 = new tri(pt67, pt68, pt69, 50, 0.7);
    var tri25 = new tri(pt70, pt71, pt72, 100, 0.7);
    var tri26 = new tri(pt73, pt74, pt75, 100, 0.7);
    var tri27 = new tri(pt76, pt77, pt78, 100, 0.7);
    var tri28 = new tri(pt79, pt80, pt81, 50, 0.7);
    var tri29 = new tri(pt82, pt83, pt84, 50, 0.7);
    var tri30 = new tri(pt85, pt86, pt87, 70, 0.7);
    head.slaveP = [pt1, pt2, pt3, pt4, pt5, pt6, pt7, pt8, pt9, pt12];
    neck1.slaveP = [pt10, pt11, pt15, pt16, pt30, pt31, pt32, pt33, pt34, pt35, pt36, pt37, pt38, pt85, pt86, pt87];
    spine2.slaveP = [pt14, pt17, pt18, pt19, pt20, pt21, pt22, pt23, pt29];
    humerus1.slaveP = [pt24, pt25, pt26, pt50];
    radius1.slaveP = [pt48, pt49, pt51, pt52, pt53];
    humerus2.slaveP = [pt27, pt28];
    radius2.slaveP = [pt39, pt40, pt41, pt42, pt43, pt44, pt45, pt46, pt47];
    spine1.slaveP = [pt54, pt55, pt56, pt58, pt59, pt60, pt61, pt62, pt68, pt69];
    tail.slaveP = [pt63, pt64, pt65, pt66];
    shin2.slaveP = [pt67, pt76, pt77, pt78, pt82, pt83, pt84];
    thigh1.slaveP = [pt57, pt72];
    shin1.slaveP = [pt70, pt71, pt73, pt74, pt75, pt79, pt80, pt81];




    var canvas = document.getElementById("drawingSURFACE");
    canvas.onclick = jiggleshit;
    var ctx = canvas.getContext('2d');
    ctx.canvas.width = 700;
    ctx.canvas.height = 400;
    setInterval(ADVANCE, count);
    //ADVANCE gets called in intervals of count length in ms//
    function ADVANCE() {
        countup += 0.6; //0.8
        countup2 += 0.3;
        ////////////////animate bones/////////
        spine1.cy = 180 + Math.sin(countup) * 15;
        spine1.cx = 450 + Math.sin(countup + 1.57) * 2;
        spine1.rot = 201 + Math.sin(countup) * 3;
        spine2.cy = spine1.getpin().py;
        spine2.cx = spine1.getpin().px;
        spine2.rot = 165 + Math.sin(countup - 3.14) * 3;
        neck1.cy = spine2.getpin().py;
        neck1.cx = spine2.getpin().px;
        neck1.rot = 180 + Math.cos(countup) * 5;
        head.cy = neck1.getpin().py;
        head.cx = neck1.getpin().px;
        head.rot = 110 + Math.cos(countup) * 3;
        tail.cy = spine1.cy;
        tail.cx = spine1.cx;
        tail.rot = -50 + Math.sin(countup) * 10;
        //rear legs
        thigh1.cy = spine1.cy;
        thigh1.cx = spine1.cx;
        thigh2.cy = spine1.cy;
        thigh2.cx = spine1.cx;
        //shin1.cx = 50;
        //front legs
        humerus1.cy = neck1.cy;
        humerus1.cx = neck1.cx;
        humerus2.cy = neck1.cy;
        humerus2.cx = neck1.cx;
        applyKinematics(thigh1, shin1, 435 + Math.sin(countup2) * 40, 300 + Math.cos(countup2) * 20, false);
        applyKinematics(thigh2, shin2, 465 + Math.sin(countup2 + 3.14) * 40, 300 + Math.cos(countup2 + 3.14) * 25, false);
        applyKinematics(humerus1, radius1, 240 + Math.sin(countup2 + 1.9) * 40, 303 + Math.cos(countup2 + 1.9) * 22, true); //back
        applyKinematics(humerus2, radius2, 230 + Math.sin(countup2 + 3.14 + 1.9) * 40, 303 + Math.cos(countup2 + 3.14 + 1.9) * 40, true); //front
        //apply transform matrix to each point pos
        for (var i = 0; i < bonearray.length; i++) {
            applyTRANSFORM(bonearray[i]);
        };
        //animate each point towards tx and ty;
        for (var i = 0; i < pointarray.length; i++) {
            if (pointarray[i].spring > 1.1) {
                friction = 0.6;
            } else {
                friction = 0.8;
            };
            var ax = (pointarray[i].tx - pointarray[i].cx) * pointarray[i].spring;
            pointarray[i].vx += ax;
            pointarray[i].vx *= friction;
            pointarray[i].cx += pointarray[i].vx;
            var ay = (pointarray[i].ty - pointarray[i].cy) * pointarray[i].spring;
            pointarray[i].vy += ay;
            pointarray[i].vy *= friction;
            pointarray[i].cy += pointarray[i].vy
        };
        //clear canvas
        ctx.clearRect(0, 0, 700, 400); //x y w h
        for (var i = 0; i < bonearray.length; i++) {
            ctx.strokeStyle = "rgb(255,255,255)";
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(bonearray[i].cx, bonearray[i].cy);
            ctx.lineTo(bonearray[i].getpin().px, bonearray[i].getpin().py);
            ctx.stroke();
        };
        for (var i = 0; i < triarray.length; i++) {
            ctx.fillStyle = "rgba(" + triarray[i].colour + "," + triarray[i].colour + "," + triarray[i].colour + "," + triarray[i].a + ")";
            ctx.beginPath();
            ctx.moveTo(triarray[i].point1.cx, triarray[i].point1.cy);
            ctx.lineTo(triarray[i].point2.cx, triarray[i].point2.cy);
            ctx.lineTo(triarray[i].point3.cx, triarray[i].point3.cy);
            ctx.closePath();
            ctx.fill();
        }; //end of drawing loop
    } //end of ADVANCE

};

run();
