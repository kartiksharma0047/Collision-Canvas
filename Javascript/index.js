let canvas = document.querySelector("canvas");
let c = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let mouse = {
    x: undefined,
    y: undefined
};
let colors = ["#51e2f5", "#9df9ef", "#edf756", "#ffa8B6", "#a28089"];
let circle = [];

window.addEventListener("mousemove", function (event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

function randomIntFromRange(min, max) {  //Get random values
    return Math.floor(Math.random() * (max - min + 1) + min);
}

window.addEventListener("resize", function () {  //Resize canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

function randomColor(colors) {   //Get random color
    return colors[Math.floor(Math.random() * colors.length)];
}

function getDistance(x1, y1, x2, y2) {
    let xDistance = x2 - x1;
    let yDistance = y2 - y1;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);

        // Velocity after 1d collision equation
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.velocity.x = vFinal1.x;
        particle.velocity.y = vFinal1.y;
        otherParticle.velocity.x = vFinal2.x;
        otherParticle.velocity.y = vFinal2.y;
    }
}

function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };
    return rotatedVelocities;
}

function Circle(x, y, radius, strokeWidth) {
    let obj = {};
    obj.x = x;
    obj.y = y;
    obj.velocity = {
        x: Math.random() < 0.5 ? 3 : -3,  // Adjust x speed
        y: Math.random() < 0.5 ? 3 : -3   // Adjust y speed
    };
    obj.radius = radius;
    obj.OriginalRadius = obj.radius;
    obj.color = randomColor(colors);
    obj.strokeWidth = strokeWidth;
    obj.opacity = 0.3;
    obj.mass = 1;
    obj.fillColor = "transparent"

    obj.update = particles => {
        obj.draw();
        obj.x += obj.velocity.x;
        obj.y += obj.velocity.y;

        // Check for collision with window borders
        if (obj.x + obj.radius + obj.strokeWidth > canvas.width) {
            obj.x = canvas.width - obj.radius - obj.strokeWidth;
            obj.velocity.x = -obj.velocity.x;
        } else if (obj.x - obj.radius - obj.strokeWidth < 0) {
            obj.x = obj.radius + obj.strokeWidth;
            obj.velocity.x = -obj.velocity.x;
        }
        if (obj.y + obj.radius + obj.strokeWidth > canvas.height) {
            obj.y = canvas.height - obj.radius - obj.strokeWidth;
            obj.velocity.y = -obj.velocity.y;
        } else if (obj.y - obj.radius - obj.strokeWidth < 0) {
            obj.y = obj.radius + obj.strokeWidth;
            obj.velocity.y = -obj.velocity.y;
        }
        for (let i = 0; i < particles.length; i++) {
            if (obj === particles[i]) {
                continue;
            }
            if (getDistance(obj.x, obj.y, particles[i].x, particles[i].y) - obj.radius * 2 < 0) {
                resolveCollision(obj, particles[i])
            }
        }
        if (mouse.x - obj.x < 100 && mouse.x - obj.x > -100 && mouse.y - obj.y < 100 && mouse.y - obj.y > -100) {
            obj.opacity = 1
            obj.radius = 25;
            obj.fillColor = obj.color
        } else {
            obj.opacity = 0.3
            obj.fillColor = "transparent"
            obj.radius = obj.OriginalRadius
        }
    }

    obj.draw = () => {
        c.beginPath();
        c.globalAlpha = obj.opacity;
        c.strokeStyle = obj.color;
        c.fillStyle = obj.fillColor;
        c.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2, false);
        c.stroke();
        c.globalAlpha = 0.4;
        c.fill();
        c.lineWidth = obj.strokeWidth;
        c.closePath();
    }

    return obj;
}

let particles = [];

for (let i = 0; i < 100; i++) {
    const strokeWidth = 3;
    const radius = 15;
    let x = randomIntFromRange(radius + strokeWidth + 2, canvas.width - radius - strokeWidth - 2);
    let y = randomIntFromRange(radius + strokeWidth + 2, canvas.height - radius - strokeWidth - 2);
    if (i !== 0) {
        for (let j = 0; j < particles.length; j++) {
            if ((getDistance(x, y, particles[j].x, particles[j].y) - radius * 2 < 0)) {
                x = randomIntFromRange(radius + strokeWidth, canvas.width - radius - strokeWidth);
                y = randomIntFromRange(radius + strokeWidth, canvas.height - radius - strokeWidth);
                j = -1;
            }
        }
    }
    particles.push(Circle(x, y, radius, strokeWidth));
}

function animate() {
    requestAnimationFrame(animate);
    c.clearRect(0, 0, innerWidth, innerHeight);
    particles.forEach((particle => {
        particle.update(particles);
    }))
}

animate();
