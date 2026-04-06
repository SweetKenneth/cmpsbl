# Content from https://raw.githubusercontent.com/bulletphysics/bullet3/master/examples/pybullet/gym/pybullet_envs/env_bases.py

import gym, gym.spaces, gym.utils, gym.utils.seeding
import numpy as np
import pybullet
import os

from pybullet\_utils import bullet\_client

from pkg\_resources import parse\_version

try:
 if os.environ\["PYBULLET\_EGL"\]:
 import pkgutil
except:
 pass

class MJCFBaseBulletEnv(gym.Env):
 """
 Base class for Bullet physics simulation loading MJCF (MuJoCo .xml) environments in a Scene.
 These environments create single-player scenes and behave like normal Gym environments, if
 you don't use multiplayer.
 """

 metadata = {'render.modes': \['human', 'rgb\_array'\], 'video.frames\_per\_second': 60}

 def \_\_init\_\_(self, robot, render=False):
 self.scene = None
 self.physicsClientId = -1
 self.ownsPhysicsClient = 0
 self.camera = Camera(self)
 self.isRender = render
 self.robot = robot
 self.seed()
 self.\_cam\_dist = 3
 self.\_cam\_yaw = 0
 self.\_cam\_pitch = -30
 self.\_render\_width = 320
 self.\_render\_height = 240

 self.action\_space = robot.action\_space
 self.observation\_space = robot.observation\_space
 #self.reset()

 def configure(self, args):
 self.robot.args = args

 def seed(self, seed=None):
 self.np\_random, seed = gym.utils.seeding.np\_random(seed)
 self.robot.np\_random = self.np\_random # use the same np\_randomizer for robot as for env
 return \[seed\]

 def reset(self):
 if (self.physicsClientId < 0):
 self.ownsPhysicsClient = True

 if self.isRender:
 self.\_p = bullet\_client.BulletClient(connection\_mode=pybullet.GUI)
 else:
 self.\_p = bullet\_client.BulletClient()
 self.\_p.resetSimulation()
 self.\_p.setPhysicsEngineParameter(deterministicOverlappingPairs=1)
 #optionally enable EGL for faster headless rendering
 try:
 if os.environ\["PYBULLET\_EGL"\]:
 con\_mode = self.\_p.getConnectionInfo()\['connectionMethod'\]
 if con\_mode==self.\_p.DIRECT:
 egl = pkgutil.get\_loader('eglRenderer')
 if (egl):
 self.\_p.loadPlugin(egl.get\_filename(), "\_eglRendererPlugin")
 else:
 self.\_p.loadPlugin("eglRendererPlugin")
 except:
 pass
 self.physicsClientId = self.\_p.\_client
 self.\_p.configureDebugVisualizer(pybullet.COV\_ENABLE\_GUI, 0)

 if self.scene is None:
 self.scene = self.create\_single\_player\_scene(self.\_p)
 if not self.scene.multiplayer and self.ownsPhysicsClient:
 self.scene.episode\_restart(self.\_p)

 self.robot.scene = self.scene

 self.frame = 0
 self.done = 0
 self.reward = 0
 dump = 0
 s = self.robot.reset(self.\_p)
 self.potential = self.robot.calc\_potential()
 return s

 def camera\_adjust(self):
 pass

 def render(self, mode='human', close=False):

 if mode == "human":
 self.isRender = True
 if self.physicsClientId>=0:
 self.camera\_adjust()

 if mode != "rgb\_array":
 return np.array(\[\])

 base\_pos = \[0, 0, 0\]
 if (hasattr(self, 'robot')):
 if (hasattr(self.robot, 'body\_real\_xyz')):
 base\_pos = self.robot.body\_real\_xyz
 if (self.physicsClientId>=0):
 view\_matrix = self.\_p.computeViewMatrixFromYawPitchRoll(cameraTargetPosition=base\_pos,
 distance=self.\_cam\_dist,
 yaw=self.\_cam\_yaw,
 pitch=self.\_cam\_pitch,
 roll=0,
 upAxisIndex=2)
 proj\_matrix = self.\_p.computeProjectionMatrixFOV(fov=60,
 aspect=float(self.\_render\_width) /
 self.\_render\_height,
 nearVal=0.1,
 farVal=100.0)
 (\_, \_, px, \_, \_) = self.\_p.getCameraImage(width=self.\_render\_width,
 height=self.\_render\_height,
 viewMatrix=view\_matrix,
 projectionMatrix=proj\_matrix,
 renderer=pybullet.ER\_BULLET\_HARDWARE\_OPENGL)

 self.\_p.configureDebugVisualizer(self.\_p.COV\_ENABLE\_SINGLE\_STEP\_RENDERING,1)
 else:
 px = np.array(\[\[\[255,255,255,255\]\]\*self.\_render\_width\]\*self.\_render\_height, dtype=np.uint8)
 rgb\_array = np.array(px, dtype=np.uint8)
 rgb\_array = np.reshape(np.array(px), (self.\_render\_height, self.\_render\_width, -1))
 rgb\_array = rgb\_array\[:, :, :3\]
 return rgb\_array

 def close(self):
 if (self.ownsPhysicsClient):
 if (self.physicsClientId >= 0):
 self.\_p.disconnect()
 self.physicsClientId = -1

 def HUD(self, state, a, done):
 pass

 # def step(self, \*args, \*\*kwargs):
 # if self.isRender:
 # base\_pos=\[0,0,0\]
 # if (hasattr(self,'robot')):
 # if (hasattr(self.robot,'body\_xyz')):
 # base\_pos = self.robot.body\_xyz
 # # Keep the previous orientation of the camera set by the user.
 # #\[yaw, pitch, dist\] = self.\_p.getDebugVisualizerCamera()\[8:11\]
 # self.\_p.resetDebugVisualizerCamera(3,0,0, base\_pos)
 #
 #
 # return self.step(\*args, \*\*kwargs)
 if parse\_version(gym.\_\_version\_\_) < parse\_version('0.9.6'):
 \_render = render
 \_reset = reset
 \_seed = seed

class Camera:

 def \_\_init\_\_(self, env):
 self.env = env
 pass

 def move\_and\_look\_at(self, i, j, k, x, y, z):
 lookat = \[x, y, z\]
 camInfo = self.env.\_p.getDebugVisualizerCamera()

 distance = camInfo\[10\]
 pitch = camInfo\[9\]
 yaw = camInfo\[8\]
 self.env.\_p.resetDebugVisualizerCamera(distance, yaw, pitch, lookat)