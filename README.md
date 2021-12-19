
<a href="https://github.com/nocturneio"><img src="https://i.imgur.com/cVSsETP.png" align="left" height="174" width="174"/></a>

## TimeToGuess
**Jouez avec vos amis en équipe**


<br>


[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Donate](https://img.shields.io/badge/Donate-PayPal-green.svg)](https://paypal.me/nocturnelab)
___

| Android | iOS |
|:-:|:-:|
| [<img src="https://camo.githubusercontent.com/14aff0715e7c45aa33a99be1c282faf39181e284f3c25fbb60556a25bb9cdcee/68747470733a2f2f63646e2e7261776769742e636f6d2f73746576657269636865792f676f6f676c652d706c61792d62616467652d7376672f6d61737465722f696d672f66725f6765742e737667" height="50">](https://play.google.com/store/apps/details?id=app.nocturne.timetoguess) | [<img src="https://github.com/lopezjurip/app-badges/blob/gh-pages/appstore.png?raw=true" height="33">](https://apps.apple.com/us/app/timetoguess/id1597468541) |

___

## Présentation

TimeToGuess est un jeu de société jouable en 3 manches qui nécessite un minimum de 4 personnes pour jouer. À chaque manche, une personne joue contre la montre pour faire deviner à son équipe le plus de mots ou de phrases possible !

Avant le début du jeu, chaque personne ajoute un certain nombre de mots ou de phrases dans la liste. Ces mots ou phrases sont ceux que vous devez faire deviner à votre équipe à chaque tour. Après chaque tour, les mots sont recyclés dans le jeu.

Mais ! Il y a des règles différentes pour chaque tour. Au premier tour, vous pouvez seulement expliquer le mot ou la phrase sans utiliser de gestes. Au deuxième tour, vous ne pouvez que mimer le mot ou la phrase sans parler. Au dernier tour, le plus difficile, vous ne pouvez dire qu'un seul mot pour faire deviner le mot à votre équipe.

## Développement

Installer le CLI Expo
`npm install --global expo-cli`

Lancer l'application en mode développement
`expo install && expo start`

Installez `Expo Go` sur votre téléphone et connectez vous en Wifi sur le même réseau que votre ordinateur, lancez ensuite l'application dans `Expo Go`

## Architecture
L'application se base sur React Native, ce qui permet d'avoir une application Cross Platform entre iOS et Android, plus particulièrement sur le Framework Expo qui permet un accès facile aux APIs de iOS et Android.

Le jeu étant multi-joueurs l'application permet une synchronisation des variables de la partie en temps réel avec `Firebase Realtime Database` entre tout les joueurs. Le principe est simple chaque joueur va s'abonner en `PUB/SUB` à un `topic` de base de donnée et va pouvoir émettre des modifications sur la partie et recevoir quand un élément à changer dans la partie et ce pour tout les joueurs. L'avantage de ce système permet une synchronisation de toutes les variables de partie entre tout les joueurs ce qui est nécessaire dans ce concept d'application.

![enter image description here](https://i.imgur.com/hoEyEqF.png)

Pour le debugging du jeu, l'application envoi des événement à `Firebase Analytics Events` dès que le joueur clique sur un élément de l'application pour suivre son utilisation et débuguer précisément si une fonctionnalité provoque une erreur.
 
![enter image description here](https://i.imgur.com/F9sXmlH.png)

## Contributions
Les demandes de pull sont les bienvenues. Pour les changements majeurs, veuillez d'abord ouvrir une issue pour discuter de ce que vous aimeriez changer.


## License
[MIT](https://choosealicense.com/licenses/mit/)
