import * as React from 'react';
import Container from '@mui/material/Container';

const QwirkleInstructions = () => {
    return (
      <Container>
        <h2>How to Play Qwirkle</h2>
  
        <h3>Objective:</h3>
        <p>The goal of Qwirkle is to score the most points by strategically placing tiles on the game board to create lines of tiles that share a common attribute.</p>
  
        <h3>Components:</h3>
        <p>Each Qwirkle tile has a shape and a color. There are 6 colors and 6 shapes, making 36 unique tiles. There are 3 copies of each tile, making a total of 108 tiles.</p>
  
        <h3>Gameplay:</h3>
        <ol>
          <li>
            <strong>Setup: </strong>Each player starts with six random tiles.
          </li>
          <li>
            <strong>Opening move: </strong>The first player is determined by who can make the biggest opening move, and the turn order proceeds clockwise.
            <ul>
              <li><strong>NOTE: </strong>If you have the opening move, you must place the maximum number of tiles. The game will not let you make an invalid move.</li>
            </ul>
          </li>
          <li>
            <strong>Turns: </strong>On your turn, you have two options: place tiles on the board to score points or exchange some or all of your tiles.             Once you are done placing tiles or selecting tiles to swap, press <strong>"End Turn"</strong>.
            <ul>
              <li><strong>Placing tiles: </strong> To place a tile, select the desired tile from your hand and click on the appropriate spot on the game board. 
                <ul>
                  <li>On each turn, tiles can be placed horizontally or vertically as long as they are in a <strong>single</strong> continuous line.</li>
                  <li>Each line of tiles on the board must be either all the same color with different shapes or all the same shape with different colors. The same tile cannot be repeated in a line.</li>
                  <li>Tiles must be placed adjacent to existing tiles on the board.</li>
                </ul>
              </li>
              <li><strong>Exchanging tiles: </strong>To swap a tile, select the desired tile from your hand and click <strong>Swap</strong>.</li>
            </ul>
          </li>
          <li>
            <strong>Scoring:</strong>
            <ul>
              <li>You earn points based on the lengths of the lines your placed tiles form. Each line that your tiles contribute to adds to your score.</li>
              <li>If your tiles create a line of six tiles (a "Qwirkle"), you score an additional six points.</li>
            </ul>
          </li>
          <li>
            <strong>Drawing New Tiles: </strong> After your turn, you replenish your hand by drawing tiles from the bag of remaining tiles until you have six tiles again.
          </li>
          <li>
            <strong>End of the Game: </strong>The game continues until the bag is empty, and one player has used all their tiles.
            <ul>
              <li>The first player to place all the tiles in their hand gets 6 bonus points.</li>
              <li>The player with the highest score wins. In case of a tie, the player with the fewest remaining tiles wins.</li>
            </ul>
          </li>
        </ol>
        </Container>
    );
  }
  
  export default QwirkleInstructions;