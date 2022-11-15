import * as PIXI from 'pixi.js'

let onScreenCanvas: HTMLCanvasElement = document.createElement("canvas");
document.body.appendChild(onScreenCanvas);
const CanvasWidth: number = 640;
const CanvasHeight: number = 360;

const app: PIXI.Application = new PIXI.Application({ view: onScreenCanvas, width: CanvasWidth, height: CanvasHeight, background: '#00000' });

import { Player } from './PlayerData';
const playerData = new Player();
const collectibleItemsList: PIXI.Sprite[] = [];
let stateInGame: boolean = false;
let playerModel: PIXI.Sprite;

initGame();

function initGame() {

  ResetPlayerData();
  LoadGameAssets();
  LoadPlayerAssets();

}

function ResetPlayerData() {

  playerData.lives = 10;
  playerData.points = 0;
  playerData.speed = 1;

}

async function LoadGameAssets() {

  await PIXI.Assets.init({ manifest: "items.json" });
  const gameScreenAssets = await PIXI.Assets.loadBundle('assets');

  for (let i in gameScreenAssets) {

    const item: PIXI.Sprite = PIXI.Sprite.from(i);
    item.anchor.set(0.5);
    item.y = 0;
    item.renderable = false;
    collectibleItemsList.push(item);
    app.stage.addChild(item);

  }
}

async function LoadPlayerAssets() {

  const texture = await PIXI.Assets.load('textures/Player/knight iso char_idle_0.png');
  playerModel = PIXI.Sprite.from(texture);
  playerModel.anchor.set(0.5);
  playerModel.x = app.screen.width / 2;
  playerModel.y = app.screen.height - 100;
  app.stage.addChild(playerModel);

}

const style = new PIXI.TextStyle({
  fontFamily: 'Arial',
  fontSize: 36,
  fontStyle: 'italic',
  fontWeight: 'bold',
  fill: ['#ffffff', '#00ff99'], // gradient
  stroke: '#4a1850',
  strokeThickness: 5,
  dropShadow: true,
  dropShadowColor: '#000000',
  dropShadowBlur: 4,
  dropShadowAngle: Math.PI / 6,
  dropShadowDistance: 6,
  wordWrap: true,
  wordWrapWidth: 440,
  lineJoin: 'round',
});

const richText: PIXI.Text = new PIXI.Text('Click or Tap on screen to start game', style);
richText.x = 50;
richText.y = 20;

app.stage.addChild(richText);

function UpdateCollectibleItems() {

  collectibleItemsList.forEach(function (value, index) {

    if (value.renderable) {

      value.y = UpdateCollectibleItemsPositions(value.y);

      if (CheckCollectibleItemsPosition(value.y))
        CheckCollectibleItemsCollection(index);
      else {

        CollectibleItemsDisable(index);
        CheckGameEnd();

      }

    } else {

      if (RandomizeSpawnerTime())
        SpawnCollectibleItems(index);

    }

  });

}


function UpdateCollectibleItemsPositions(pos: number): number {

  return pos += 1;

}

function CheckCollectibleItemsPosition(pos: number): boolean {

  if (pos > CanvasHeight)
    return false;
  else
    return true;

}


function CheckCollectibleItemsCollection(id: number) {

  if (CheckAABBCollisin(collectibleItemsList[id], playerModel)) {

    CollectibleItemsDisable(id);
    playerData.points++;
    richText.text = `Points: ${playerData.points}`;

  }

}


function CollectibleItemsDisable(collectibleItem: number) {

  collectibleItemsList[collectibleItem].renderable = false;
  collectibleItemsList[collectibleItem].y = 0;

}

function SpawnCollectibleItems(collectibleItem: number) {

  collectibleItemsList[collectibleItem].renderable = true;
  collectibleItemsList[collectibleItem].x = Math.random() * window.innerHeight;

}



function RandomizeSpawnerTime(): boolean {

  return Math.random() < 0.01;

}


function CheckGameEnd() {

  playerData.lives -= 1;

  if (playerData.lives < 0) {

    stateInGame = false;
    richText.text = `End Game Points: ${playerData.points} Click or Tap on screen to start new game`;

  }

}

function CheckAABBCollisin(object1: PIXI.Sprite, object2: PIXI.Sprite) {

  const bounds1 = object1.getBounds();
  const bounds2 = object2.getBounds();

  return bounds1.x < bounds2.x + bounds2.width
    && bounds1.x + bounds1.width > bounds2.x
    && bounds1.y < bounds2.y + bounds2.height
    && bounds1.y + bounds1.height > bounds2.y;

}

app.ticker.add((delta) => {

  if (stateInGame)
    UpdateCollectibleItems();

});

onScreenCanvas.addEventListener('pointermove', onPointerMove);
onScreenCanvas.addEventListener('pointerdown', onPointerDown);

function onPointerMove(event: any) {

  if (stateInGame)

    playerModel.x = event.clientX;

}


function onPointerDown(event: any) {

  if (!stateInGame)

    StartGame();

}

function StartGame() {

  stateInGame = true;
  richText.text = `Points: ${playerData.points}`;
  ResetPlayerData();

  collectibleItemsList.forEach(function (value, index) {

    CollectibleItemsDisable(index);

  });

}