const k = kaboom({
	fullscreen: true,
	debug: true,
	clearColor: [0, 0, 0, 1],
	plugins: [ asepritePlugin, ],
});

const NUM_REPLS = 11;
const INIT_SCALE = 5;
const ZOOM_SPEED = 0.4;
const NAME_TIME = 44;
// const NAME_TIME = 4;

k.loadRoot("img/");
k.loadSprite("mark", "mark.png");
k.loadSprite("notmark", "notmark.png");
k.loadSprite("title", "title.png");

for (let i = 2; i <= 5; i++) {
	k.loadSprite(`title${i}`, `title${i}.png`);
}

k.loadSprite("star", "star.png");
k.loadSprite("bling", "bling.png");
k.loadRoot("img/game/");

function genChara(name, i) {

	const cols = 4;
	const x = i % 4; // 2
	const y = ~~(i / 4); // 1
	const w = 3;
	const h = 4;

	const dirs = [
		"down",
		"left",
		"right",
		"up",
	];

	const anims = {};

	dirs.forEach((dir, idx) => {
		const start = y * cols * w * h + x * w + cols * w * idx;
		anims[`walk_${dir}`] = {
			from: start,
			to: start + 2,
		};
		anims[`idle_${dir}`] = {
			from: start + 1,
			to: start + 1,
		};
	});

	k.loadSprite(name, "chara.png", {
		gridWidth: 26,
		gridHeight: 36,
		anims: anims,
	});

}

genChara("player", 6);

k.loadSprite("chest", "chest.png", {
	sliceX: 4,
	anims: {
		"lock": {
			from: 0,
			to: 0,
		},
		"open": {
			from: 1,
			to: 3,
		},
	},
});

k.loadSprite("terrain", "terrain.png");

k.loadRoot("img/ui/");
k.loadSprite("window", "window.png");
k.loadSprite("frame", "frame.png");
k.loadSprite("name", "name.png");
k.loadSprite("desc", "desc.png");
k.loadSprite("url", "url.png");
k.loadSprite("tag0", "tag0.png");
k.loadSprite("tag1", "tag1.png");
k.loadRoot("img/repls/");

for (let i = 0; i < NUM_REPLS; i++) {
	k.loadSprite(`repl${i}`, `repl${i}.png`);
}

k.loadRoot("sounds/");
k.loadSound("strauss", "strauss.mp3");
k.loadSound("burp", "burp.mp3");

const w = k.width();
const h = k.height();

const burstItems = [
	...Array(NUM_REPLS).fill(0).map((_, i) => `repl${i}`),
	"mark",
];

const replSlots = [
	{
		sprite: "repl1",
		pos: k.vec2(w / 2 - 360, h / 2),
		time: 18,
	},
	{
		sprite: "repl6",
		pos: k.vec2(w / 2 + 360, h / 2),
		time: 22,
	},
	{
		sprite: "repl0",
		pos: k.vec2(w / 2 - 360, h / 2 + 320),
		time: 24,
	},
	{
		sprite: "repl3",
		pos: k.vec2(w / 2, h / 2 + 320),
		time: 32,
	},
	{
		sprite: "repl4",
		pos: k.vec2(w / 2 + 360, h / 2 + 320),
		time: 30,
	},
];

const uiSlots = [
	{
		sprite: "frame",
		pos: k.vec2(w / 2, h / 2),
		time: 9.5,
	},
	{
		sprite: "name",
		pos: k.vec2(w / 2 - 450, h / 2 - 340),
		time: 32,
	},
	{
		sprite: "desc",
		pos: k.vec2(w / 2 - 130, h / 2 - 260),
		time: 34,
	},
	{
		sprite: "tag0",
		pos: k.vec2(w / 2 - 460, h / 2 - 150),
		time: 24,
	},
	{
		sprite: "tag1",
		pos: k.vec2(w / 2 - 440, h / 2 + 170),
		time: 30,
	},
	{
		sprite: "url",
		pos: k.vec2(w / 2 - 454, h / 2 - 450),
		time: 38,
	},
];

k.scene("main", () => {

	k.layers([
		"stars",
		"game",
		"ui",
	], "game");

	k.camIgnore(["stars", "ui"]);

	const music = k.play("strauss", {
		speed: 1.1,
	});
	music.stop();
	let scaleDest = k.vec2(INIT_SCALE);
// 	let scaleDest = k.vec2(0.5);
	let loop;
	let opened = false;
	let leftRepls = [...replSlots];

	k.gravity(640);

	k.add([
		k.sprite("window"),
		k.origin("center"),
		k.pos(w / 2, h / 2),
	]);

	function lifespan(time) {
		let timer = 0;
		return {
			update() {
				this.color.a = k.mapc(timer, 0, time, 1, 0);
				timer += k.dt();
				if (timer > time) {
					k.destroy(this);
				}
			},
		};
	}

	function genBling(pos, angle, range) {
		const dir = k.vec2(Math.cos(angle), Math.sin(angle));
		const dest = pos.add(dir.scale(range));
		k.add([
			k.pos(pos),
			k.sprite("bling"),
			k.origin("center"),
			k.rotate(k.rand(0, Math.PI * 2)),
			k.color(),
			k.scale(k.rand(0, 0.5)),
			lifespan(k.rand(1)),
			{
				update() {
					this.pos = this.pos.lerp(dest, k.dt() * 3);
				},
			}
		]);
	}

	function disappear(from, time) {
		return {
			update() {
				if (opened) {
					this.color.a = k.mapc(k.time(), openTime + from, openTime + from + time, 1, 0);
				} else {
					this.color.a = 1;
				}
			}
		};
	}

	const bg = k.add([
		k.sprite("terrain"),
		k.pos(w / 2, h / 2),
		k.origin("center"),
		k.color(),
		disappear(0, 9),
	]);

	const chest = k.add([
		k.sprite("chest"),
		k.pos(w / 2, h / 2),
		k.origin("center"),
		k.solid(),
	]);

	const player = k.add([
		k.sprite("player"),
		k.pos(w / 2, h / 2 + 32),
		k.origin("center"),
		k.area(k.vec2(-8, -4), k.vec2(8, 16)),
		k.color(),
		disappear(6, 3),
		{
			dir: "down",
			moving: false,
		},
	]);

	player.play("idle_up");

	const PLAYER_SPEED = 40;

	const dirs = ["left", "right", "up", "down"];

	const dirMap = {
		"left": k.vec2(-1, 0),
		"right": k.vec2(1, 0),
		"up": k.vec2(0, -1),
		"down": k.vec2(0, 1),
	};

	player.action(() => {
		if (player.moving) {
			player.move(dirMap[player.dir].scale(PLAYER_SPEED));
		};
		player.resolve();
	});

	dirs.forEach((dir) => {
		k.keyPress(dir, () => {
			player.dir = dir;
			player.moving = true;
			player.play(`walk_${player.dir}`);
		});
		k.keyRelease(dir, () => {
			let stopped = true;
			dirs.forEach((dir2) => {
				if (k.keyIsDown(dir2)) {
					stopped = false;
					player.dir = dir2;
					player.play(`walk_${player.dir}`);
				}
			});
			if (stopped) {
				player.moving = false;
				player.play(`idle_${player.dir}`);
			}
		});
	});

	chest.action(() => {
		if (chest.isHovered()) {
			k.cursor("pointer");
		} else {
			k.cursor("default");
		}
	});

	function calcVelX(start, dest, force, acc) {

		const diffY = start.y - dest.y;
		const tUp = force / acc;
		const disUp = -force * tUp + 0.5 * acc * tUp * tUp;
		const dis = dest.y - (start.y + disUp);
		const tDown = Math.sqrt(2 * dis / acc);
		const time = tUp + tDown;

		return (dest.x - start.x) / time;

	}

	function toggle() {

		if (opened) {

			loop.stop();
			music.stop();
			chest.play("lock");
			opened = false;
			scaleDest = k.vec2(INIT_SCALE);
			leftRepls = [...replSlots];
			k.destroyAll("item");
			titleScaleDest = 0;
			filter.color.a = 0;

		} else {

			chest.play("open", false);
			music.play();
			opened = true;
			openTime = k.time();

			uiSlots.forEach((ui) => {
				k.add([
					k.sprite(ui.sprite),
					k.pos(ui.pos),
					k.origin("center"),
					k.color(1, 1, 1, 0),
					"item",
					{
						update() {
							this.color.a = k.mapc(
								k.time(),
								openTime + ui.time,
								openTime + ui.time + 2,
								0, 1
							);
						},
					},
				]);
			});

			loop = k.loop(0.1, () => {

				const numStars = k.mapc(
					k.time(),
					openTime + NAME_TIME - 12,
					openTime + NAME_TIME + 4,
					0,
					8,
				);

				for (let i = 0; i < numStars; i++) {
					genStar();
				}

				const curTime = k.time();
				let dest = null;

				for (let i = 0; i < leftRepls.length; i++) {
					if (curTime - openTime >= leftRepls[i].time) {
						dest = leftRepls[i];
						leftRepls.splice(i, 1);
						break;
					}
				}

				let velY = -k.rand(400, 1200);
				const velX = dest ?
					calcVelX(chest.pos, dest.pos, -velY, k.gravity())
					: k.rand(120, 640) * k.choose([-1, 1]);

				k.add([
					k.sprite(dest ? dest.sprite : k.choose(burstItems)),
					k.scale(0),
					k.pos(chest.pos),
					k.origin("center"),
					k.color(),
					"item",
					{
						update() {

							this.move(0, velY);
							velY += k.gravity() * k.dt();

							if (this.scale.x < 1) {
								this.scale = this.scale.add(
									k.vec2(k.dt() * 0.5).scale(1 / (this.scale.len() + 0.1))
								);
							} else {
								this.scale = k.vec2(1);
							}

							this.move(velX, 0);

							if (velY > 0 && dest) {
								if (this.pos.y >= dest.pos.y) {
									this.scale = k.vec2(1);
									this.pos = dest.pos;
									this.paused = true;
									for (let i = 0; i < 64; i++) {
										const pos = this.pos.add(k.rand(k.vec2(-160, -102), k.vec2(160, 102)));
										genBling(pos, pos.angle(this.pos), k.rand(24, 32));
									}
								}
							}

							this.color.a = k.map(this.pos.y, h + 240, h + 640, 1, 0);

							if (this.pos.y >= h + 640) {
								k.destroy(this);
							}

						},
					},

				]);
			});

		}

	}

	function genStar() {

		let t = 0;
		const size = k.rand(0, 1);

		k.add([
			k.sprite("star"),
			k.scale(0),
			k.origin("center"),
			k.rotate(k.rand(0, Math.PI * 2)),
			k.pos(k.rand(0, w), k.rand(0, h)),
			k.layer("stars"),
			{
				update() {
					const s = Math.sin(t) * size;
					this.scale = k.vec2(s);
					this.angle += k.dt();
					t += k.dt() * 2;
					if (s < 0) {
						k.destroy(this);
					}
				},
			}
		]);
	}

	chest.clicks(toggle);

	k.keyPress("space", () => {
		if (player.isCollided(chest)) {
			toggle();
		}
	});

	k.keyPress("b", () => {
		music.stop();
		k.go("burp");
	});

	let titleScaleDest = 0;

	k.action(() => {
		const cur = k.camScale();
		const time = k.time();
		if (opened) {
			scaleDest = cur.sub(k.vec2(ZOOM_SPEED * k.dt()).scale(cur.len()));
			filter.color.a = k.mapc(
				k.time(),
				openTime + NAME_TIME - 4,
				openTime + NAME_TIME + 4,
				0,
				0.3
			);
			if (time - openTime >= NAME_TIME) {
				titleScaleDest = 1.1;
			}
		}
		k.camScale(cur.lerp(scaleDest, k.dt() * 6));
		title.scale = title.scale.lerp(k.vec2(titleScaleDest), k.dt() * 2);
	});

	const filter = k.add([
		k.rect(w, h),
		k.color(0, 0, 0, 0),
		k.layer("ui"),
	]);

	function changeTitle() {

		let timer = 0;
		let time = 3;
		let curTitle = 1;

		return {

			update() {

				if (!opened || k.time() < openTime + NAME_TIME + 6.6) {
					return;
				}

				timer += k.dt();

				if (timer > time) {
					curTitle += 1;
					if (curTitle > 5) {
						curTitle = 2;
					}
					this.changeSprite(`title${curTitle}`);
					timer = 0;
					time *= 0.8;
				}
			},
		};

	}

	const title = k.add([
		k.sprite("title"),
		k.layer("ui"),
		k.origin("center"),
		k.pos(w / 2, h / 2),
		k.scale(0),
		changeTitle(),
	]);

	k.camScale(scaleDest);

// 	items.forEach((item) => {
// 		k.add([
// 			k.sprite(item.sprite),
// 			k.origin("center"),
// 			k.pos(item.pos),
// 		]);
// 	});

});

k.scene("burp", () => {
	k.play("burp");
	k.add([
		k.sprite("notmark"),
		k.pos(w / 2, h / 2),
		k.origin("center"),
	]);
	k.keyPress("b", () => {
		k.go("burp");
	});
});

k.start("main");
