# Content from https://raw.githubusercontent.com/openai/gym/master/gym/envs/classic_control/cartpole.py

"""
Classic cart-pole system implemented by Rich Sutton et al.
Copied from http://incompleteideas.net/sutton/book/code/pole.c
permalink: https://perma.cc/C9ZM-652R
"""
import math
from typing import Optional, Union

import numpy as np

import gym
from gym import logger, spaces
from gym.envs.classic\_control import utils
from gym.error import DependencyNotInstalled

class CartPoleEnv(gym.Env\[np.ndarray, Union\[int, np.ndarray\]\]):
 """
 ### Description

 This environment corresponds to the version of the cart-pole problem described by Barto, Sutton, and Anderson in
 \["Neuronlike Adaptive Elements That Can Solve Difficult Learning Control Problem"\](https://ieeexplore.ieee.org/document/6313077).
 A pole is attached by an un-actuated joint to a cart, which moves along a frictionless track.
 The pendulum is placed upright on the cart and the goal is to balance the pole by applying forces
 in the left and right direction on the cart.

 ### Action Space

 The action is a \`ndarray\` with shape \`(1,)\` which can take values \`{0, 1}\` indicating the direction
 of the fixed force the cart is pushed with.

 \| Num \| Action \|
 \|-----\|------------------------\|
 \| 0 \| Push cart to the left \|
 \| 1 \| Push cart to the right \|

 \*\*Note\*\*: The velocity that is reduced or increased by the applied force is not fixed and it depends on the angle
 the pole is pointing. The center of gravity of the pole varies the amount of energy needed to move the cart underneath it

 ### Observation Space

 The observation is a \`ndarray\` with shape \`(4,)\` with the values corresponding to the following positions and velocities:

 \| Num \| Observation \| Min \| Max \|
 \|-----\|-----------------------\|---------------------\|-------------------\|
 \| 0 \| Cart Position \| -4.8 \| 4.8 \|
 \| 1 \| Cart Velocity \| -Inf \| Inf \|
 \| 2 \| Pole Angle \| ~ -0.418 rad (-24°) \| ~ 0.418 rad (24°) \|
 \| 3 \| Pole Angular Velocity \| -Inf \| Inf \|

 \*\*Note:\*\* While the ranges above denote the possible values for observation space of each element,
 it is not reflective of the allowed values of the state space in an unterminated episode. Particularly:
 \- The cart x-position (index 0) can be take values between \`(-4.8, 4.8)\`, but the episode terminates
 if the cart leaves the \`(-2.4, 2.4)\` range.
 \- The pole angle can be observed between \`(-.418, .418)\` radians (or \*\*±24°\*\*), but the episode terminates
 if the pole angle is not in the range \`(-.2095, .2095)\` (or \*\*±12°\*\*)

 ### Rewards

 Since the goal is to keep the pole upright for as long as possible, a reward of \`+1\` for every step taken,
 including the termination step, is allotted. The threshold for rewards is 475 for v1.

 ### Starting State

 All observations are assigned a uniformly random value in \`(-0.05, 0.05)\`

 ### Episode End

 The episode ends if any one of the following occurs:

 1\. Termination: Pole Angle is greater than ±12°
 2\. Termination: Cart Position is greater than ±2.4 (center of the cart reaches the edge of the display)
 3\. Truncation: Episode length is greater than 500 (200 for v0)

 ### Arguments

 \`\`\`
 gym.make('CartPole-v1')
 \`\`\`

 No additional arguments are currently supported.
 """

 metadata = {
 "render\_modes": \["human", "rgb\_array"\],
 "render\_fps": 50,
 }

 def \_\_init\_\_(self, render\_mode: Optional\[str\] = None):
 self.gravity = 9.8
 self.masscart = 1.0
 self.masspole = 0.1
 self.total\_mass = self.masspole + self.masscart
 self.length = 0.5 # actually half the pole's length
 self.polemass\_length = self.masspole \* self.length
 self.force\_mag = 10.0
 self.tau = 0.02 # seconds between state updates
 self.kinematics\_integrator = "euler"

 # Angle at which to fail the episode
 self.theta\_threshold\_radians = 12 \* 2 \* math.pi / 360
 self.x\_threshold = 2.4

 # Angle limit set to 2 \* theta\_threshold\_radians so failing observation
 # is still within bounds.
 high = np.array(
 \[\
 self.x\_threshold \* 2,\
 np.finfo(np.float32).max,\
 self.theta\_threshold\_radians \* 2,\
 np.finfo(np.float32).max,\
 \],
 dtype=np.float32,
 )

 self.action\_space = spaces.Discrete(2)
 self.observation\_space = spaces.Box(-high, high, dtype=np.float32)

 self.render\_mode = render\_mode

 self.screen\_width = 600
 self.screen\_height = 400
 self.screen = None
 self.clock = None
 self.isopen = True
 self.state = None

 self.steps\_beyond\_terminated = None

 def step(self, action):
 err\_msg = f"{action!r} ({type(action)}) invalid"
 assert self.action\_space.contains(action), err\_msg
 assert self.state is not None, "Call reset before using step method."
 x, x\_dot, theta, theta\_dot = self.state
 force = self.force\_mag if action == 1 else -self.force\_mag
 costheta = math.cos(theta)
 sintheta = math.sin(theta)

 # For the interested reader:
 # https://coneural.org/florian/papers/05\_cart\_pole.pdf
 temp = (
 force + self.polemass\_length \* theta\_dot\*\*2 \* sintheta
 ) / self.total\_mass
 thetaacc = (self.gravity \* sintheta - costheta \* temp) / (
 self.length \* (4.0 / 3.0 - self.masspole \* costheta\*\*2 / self.total\_mass)
 )
 xacc = temp - self.polemass\_length \* thetaacc \* costheta / self.total\_mass

 if self.kinematics\_integrator == "euler":
 x = x + self.tau \* x\_dot
 x\_dot = x\_dot + self.tau \* xacc
 theta = theta + self.tau \* theta\_dot
 theta\_dot = theta\_dot + self.tau \* thetaacc
 else: # semi-implicit euler
 x\_dot = x\_dot + self.tau \* xacc
 x = x + self.tau \* x\_dot
 theta\_dot = theta\_dot + self.tau \* thetaacc
 theta = theta + self.tau \* theta\_dot

 self.state = (x, x\_dot, theta, theta\_dot)

 terminated = bool(
 x < -self.x\_threshold
 or x > self.x\_threshold
 or theta < -self.theta\_threshold\_radians
 or theta > self.theta\_threshold\_radians
 )

 if not terminated:
 reward = 1.0
 elif self.steps\_beyond\_terminated is None:
 # Pole just fell!
 self.steps\_beyond\_terminated = 0
 reward = 1.0
 else:
 if self.steps\_beyond\_terminated == 0:
 logger.warn(
 "You are calling 'step()' even though this "
 "environment has already returned terminated = True. You "
 "should always call 'reset()' once you receive 'terminated = "
 "True' -- any further steps are undefined behavior."
 )
 self.steps\_beyond\_terminated += 1
 reward = 0.0

 if self.render\_mode == "human":
 self.render()
 return np.array(self.state, dtype=np.float32), reward, terminated, False, {}

 def reset(
 self,
 \*,
 seed: Optional\[int\] = None,
 options: Optional\[dict\] = None,
 ):
 super().reset(seed=seed)
 # Note that if you use custom reset bounds, it may lead to out-of-bound
 # state/observations.
 low, high = utils.maybe\_parse\_reset\_bounds(
 options, -0.05, 0.05 # default low
 ) # default high
 self.state = self.np\_random.uniform(low=low, high=high, size=(4,))
 self.steps\_beyond\_terminated = None

 if self.render\_mode == "human":
 self.render()
 return np.array(self.state, dtype=np.float32), {}

 def render(self):
 if self.render\_mode is None:
 gym.logger.warn(
 "You are calling render method without specifying any render mode. "
 "You can specify the render\_mode at initialization, "
 f'e.g. gym("{self.spec.id}", render\_mode="rgb\_array")'
 )
 return

 try:
 import pygame
 from pygame import gfxdraw
 except ImportError:
 raise DependencyNotInstalled(
 "pygame is not installed, run \`pip install gym\[classic\_control\]\`"
 )

 if self.screen is None:
 pygame.init()
 if self.render\_mode == "human":
 pygame.display.init()
 self.screen = pygame.display.set\_mode(
 (self.screen\_width, self.screen\_height)
 )
 else: # mode == "rgb\_array"
 self.screen = pygame.Surface((self.screen\_width, self.screen\_height))
 if self.clock is None:
 self.clock = pygame.time.Clock()

 world\_width = self.x\_threshold \* 2
 scale = self.screen\_width / world\_width
 polewidth = 10.0
 polelen = scale \* (2 \* self.length)
 cartwidth = 50.0
 cartheight = 30.0

 if self.state is None:
 return None

 x = self.state

 self.surf = pygame.Surface((self.screen\_width, self.screen\_height))
 self.surf.fill((255, 255, 255))

 l, r, t, b = -cartwidth / 2, cartwidth / 2, cartheight / 2, -cartheight / 2
 axleoffset = cartheight / 4.0
 cartx = x\[0\] \* scale + self.screen\_width / 2.0 # MIDDLE OF CART
 carty = 100 # TOP OF CART
 cart\_coords = \[(l, b), (l, t), (r, t), (r, b)\]
 cart\_coords = \[(c\[0\] + cartx, c\[1\] + carty) for c in cart\_coords\]
 gfxdraw.aapolygon(self.surf, cart\_coords, (0, 0, 0))
 gfxdraw.filled\_polygon(self.surf, cart\_coords, (0, 0, 0))

 l, r, t, b = (
 -polewidth / 2,
 polewidth / 2,
 polelen - polewidth / 2,
 -polewidth / 2,
 )

 pole\_coords = \[\]
 for coord in \[(l, b), (l, t), (r, t), (r, b)\]:
 coord = pygame.math.Vector2(coord).rotate\_rad(-x\[2\])
 coord = (coord\[0\] + cartx, coord\[1\] + carty + axleoffset)
 pole\_coords.append(coord)
 gfxdraw.aapolygon(self.surf, pole\_coords, (202, 152, 101))
 gfxdraw.filled\_polygon(self.surf, pole\_coords, (202, 152, 101))

 gfxdraw.aacircle(
 self.surf,
 int(cartx),
 int(carty + axleoffset),
 int(polewidth / 2),
 (129, 132, 203),
 )
 gfxdraw.filled\_circle(
 self.surf,
 int(cartx),
 int(carty + axleoffset),
 int(polewidth / 2),
 (129, 132, 203),
 )

 gfxdraw.hline(self.surf, 0, self.screen\_width, carty, (0, 0, 0))

 self.surf = pygame.transform.flip(self.surf, False, True)
 self.screen.blit(self.surf, (0, 0))
 if self.render\_mode == "human":
 pygame.event.pump()
 self.clock.tick(self.metadata\["render\_fps"\])
 pygame.display.flip()

 elif self.render\_mode == "rgb\_array":
 return np.transpose(
 np.array(pygame.surfarray.pixels3d(self.screen)), axes=(1, 0, 2)
 )

 def close(self):
 if self.screen is not None:
 import pygame

 pygame.display.quit()
 pygame.quit()
 self.isopen = False