# Content from https://raw.githubusercontent.com/openai/gym/master/gym/core.py

"""Core API for Environment, Wrapper, ActionWrapper, RewardWrapper and ObservationWrapper."""
import sys
from typing import (
 TYPE\_CHECKING,
 Any,
 Dict,
 Generic,
 List,
 Optional,
 SupportsFloat,
 Tuple,
 TypeVar,
 Union,
)

import numpy as np

from gym import spaces
from gym.logger import warn
from gym.utils import seeding

if TYPE\_CHECKING:
 from gym.envs.registration import EnvSpec

if sys.version\_info\[0:2\] == (3, 6):
 warn(
 "Gym minimally supports python 3.6 as the python foundation not longer supports the version, please update your version to 3.7+"
 )

ObsType = TypeVar("ObsType")
ActType = TypeVar("ActType")
RenderFrame = TypeVar("RenderFrame")

class Env(Generic\[ObsType, ActType\]):
 r"""The main OpenAI Gym class.

 It encapsulates an environment with arbitrary behind-the-scenes dynamics.
 An environment can be partially or fully observed.

 The main API methods that users of this class need to know are:

 \- :meth:\`step\` - Takes a step in the environment using an action returning the next observation, reward,
 if the environment terminated and observation information.
 \- :meth:\`reset\` - Resets the environment to an initial state, returning the initial observation and observation information.
 \- :meth:\`render\` - Renders the environment observation with modes depending on the output
 \- :meth:\`close\` - Closes the environment, important for rendering where pygame is imported

 And set the following attributes:

 \- :attr:\`action\_space\` - The Space object corresponding to valid actions
 \- :attr:\`observation\_space\` - The Space object corresponding to valid observations
 \- :attr:\`reward\_range\` - A tuple corresponding to the minimum and maximum possible rewards
 \- :attr:\`spec\` - An environment spec that contains the information used to initialise the environment from \`gym.make\`
 \- :attr:\`metadata\` - The metadata of the environment, i.e. render modes
 \- :attr:\`np\_random\` - The random number generator for the environment

 Note: a default reward range set to :math:\`(-\\infty,+\\infty)\` already exists. Set it if you want a narrower range.
 """

 # Set this in SOME subclasses
 metadata: Dict\[str, Any\] = {"render\_modes": \[\]}
 # define render\_mode if your environment supports rendering
 render\_mode: Optional\[str\] = None
 reward\_range = (-float("inf"), float("inf"))
 spec: "EnvSpec" = None

 # Set these in ALL subclasses
 action\_space: spaces.Space\[ActType\]
 observation\_space: spaces.Space\[ObsType\]

 # Created
 \_np\_random: Optional\[np.random.Generator\] = None

 @property
 def np\_random(self) -> np.random.Generator:
 """Returns the environment's internal :attr:\`\_np\_random\` that if not set will initialise with a random seed."""
 if self.\_np\_random is None:
 self.\_np\_random, seed = seeding.np\_random()
 return self.\_np\_random

 @np\_random.setter
 def np\_random(self, value: np.random.Generator):
 self.\_np\_random = value

 def step(self, action: ActType) -> Tuple\[ObsType, float, bool, bool, dict\]:
 """Run one timestep of the environment's dynamics.

 When end of episode is reached, you are responsible for calling :meth:\`reset\` to reset this environment's state.
 Accepts an action and returns either a tuple \`(observation, reward, terminated, truncated, info)\`.

 Args:
 action (ActType): an action provided by the agent

 Returns:
 observation (object): this will be an element of the environment's :attr:\`observation\_space\`.
 This may, for instance, be a numpy array containing the positions and velocities of certain objects.
 reward (float): The amount of reward returned as a result of taking the action.
 terminated (bool): whether a \`terminal state\` (as defined under the MDP of the task) is reached.
 In this case further step() calls could return undefined results.
 truncated (bool): whether a truncation condition outside the scope of the MDP is satisfied.
 Typically a timelimit, but could also be used to indicate agent physically going out of bounds.
 Can be used to end the episode prematurely before a \`terminal state\` is reached.
 info (dictionary): \`info\` contains auxiliary diagnostic information (helpful for debugging, learning, and logging).
 This might, for instance, contain: metrics that describe the agent's performance state, variables that are
 hidden from observations, or individual reward terms that are combined to produce the total reward.
 It also can contain information that distinguishes truncation and termination, however this is deprecated in favour
 of returning two booleans, and will be removed in a future version.

 (deprecated)
 done (bool): A boolean value for if the episode has ended, in which case further :meth:\`step\` calls will return undefined results.
 A done signal may be emitted for different reasons: Maybe the task underlying the environment was solved successfully,
 a certain timelimit was exceeded, or the physics simulation has entered an invalid state.
 """
 raise NotImplementedError

 def reset(
 self,
 \*,
 seed: Optional\[int\] = None,
 options: Optional\[dict\] = None,
 ) -\> Tuple\[ObsType, dict\]:
 """Resets the environment to an initial state and returns the initial observation.

 This method can reset the environment's random number generator(s) if \`\`seed\`\` is an integer or
 if the environment has not yet initialized a random number generator.
 If the environment already has a random number generator and :meth:\`reset\` is called with \`\`seed=None\`\`,
 the RNG should not be reset. Moreover, :meth:\`reset\` should (in the typical use case) be called with an
 integer seed right after initialization and then never again.

 Args:
 seed (optional int): The seed that is used to initialize the environment's PRNG.
 If the environment does not already have a PRNG and \`\`seed=None\`\` (the default option) is passed,
 a seed will be chosen from some source of entropy (e.g. timestamp or /dev/urandom).
 However, if the environment already has a PRNG and \`\`seed=None\`\` is passed, the PRNG will \*not\* be reset.
 If you pass an integer, the PRNG will be reset even if it already exists.
 Usually, you want to pass an integer \*right after the environment has been initialized and then never again\*.
 Please refer to the minimal example above to see this paradigm in action.
 options (optional dict): Additional information to specify how the environment is reset (optional,
 depending on the specific environment)

 Returns:
 observation (object): Observation of the initial state. This will be an element of :attr:\`observation\_space\`
 (typically a numpy array) and is analogous to the observation returned by :meth:\`step\`.
 info (dictionary): This dictionary contains auxiliary information complementing \`\`observation\`\`. It should be analogous to
 the \`\`info\`\` returned by :meth:\`step\`.
 """
 # Initialize the RNG if the seed is manually passed
 if seed is not None:
 self.\_np\_random, seed = seeding.np\_random(seed)

 def render(self) -> Optional\[Union\[RenderFrame, List\[RenderFrame\]\]\]:
 """Compute the render frames as specified by render\_mode attribute during initialization of the environment.

 The set of supported modes varies per environment. (And some
 third-party environments may not support rendering at all.)
 By convention, if render\_mode is:

 \- None (default): no render is computed.
 \- human: render return None.
 The environment is continuously rendered in the current display or terminal. Usually for human consumption.
 \- rgb\_array: return a single frame representing the current state of the environment.
 A frame is a numpy.ndarray with shape (x, y, 3) representing RGB values for an x-by-y pixel image.
 \- rgb\_array\_list: return a list of frames representing the states of the environment since the last reset.
 Each frame is a numpy.ndarray with shape (x, y, 3), as with \`rgb\_array\`.
 \- ansi: Return a strings (str) or StringIO.StringIO containing a
 terminal-style text representation for each time step.
 The text can include newlines and ANSI escape sequences (e.g. for colors).

 Note:
 Make sure that your class's metadata 'render\_modes' key includes
 the list of supported modes. It's recommended to call super()
 in implementations to use the functionality of this method.
 """
 raise NotImplementedError

 def close(self):
 """Override close in your subclass to perform any necessary cleanup.

 Environments will automatically :meth:\`close()\` themselves when
 garbage collected or when the program exits.
 """
 pass

 @property
 def unwrapped(self) -> "Env":
 """Returns the base non-wrapped environment.

 Returns:
 Env: The base non-wrapped gym.Env instance
 """
 return self

 def \_\_str\_\_(self):
 """Returns a string of the environment with the spec id if specified."""
 if self.spec is None:
 return f"<{type(self).\_\_name\_\_} instance>"
 else:
 return f"<{type(self).\_\_name\_\_}<{self.spec.id}>>"

 def \_\_enter\_\_(self):
 """Support with-statement for the environment."""
 return self

 def \_\_exit\_\_(self, \*args):
 """Support with-statement for the environment."""
 self.close()
 # propagate exception
 return False

class Wrapper(Env\[ObsType, ActType\]):
 """Wraps an environment to allow a modular transformation of the :meth:\`step\` and :meth:\`reset\` methods.

 This class is the base class for all wrappers. The subclass could override
 some methods to change the behavior of the original environment without touching the
 original code.

 Note:
 Don't forget to call \`\`super().\_\_init\_\_(env)\`\` if the subclass overrides :meth:\`\_\_init\_\_\`.
 """

 def \_\_init\_\_(self, env: Env):
 """Wraps an environment to allow a modular transformation of the :meth:\`step\` and :meth:\`reset\` methods.

 Args:
 env: The environment to wrap
 """
 self.env = env

 self.\_action\_space: Optional\[spaces.Space\] = None
 self.\_observation\_space: Optional\[spaces.Space\] = None
 self.\_reward\_range: Optional\[Tuple\[SupportsFloat, SupportsFloat\]\] = None
 self.\_metadata: Optional\[dict\] = None

 def \_\_getattr\_\_(self, name):
 """Returns an attribute with \`\`name\`\`, unless \`\`name\`\` starts with an underscore."""
 if name.startswith("\_"):
 raise AttributeError(f"accessing private attribute '{name}' is prohibited")
 return getattr(self.env, name)

 @property
 def spec(self):
 """Returns the environment specification."""
 return self.env.spec

 @classmethod
 def class\_name(cls):
 """Returns the class name of the wrapper."""
 return cls.\_\_name\_\_

 @property
 def action\_space(self) -> spaces.Space\[ActType\]:
 """Returns the action space of the environment."""
 if self.\_action\_space is None:
 return self.env.action\_space
 return self.\_action\_space

 @action\_space.setter
 def action\_space(self, space: spaces.Space):
 self.\_action\_space = space

 @property
 def observation\_space(self) -> spaces.Space:
 """Returns the observation space of the environment."""
 if self.\_observation\_space is None:
 return self.env.observation\_space
 return self.\_observation\_space

 @observation\_space.setter
 def observation\_space(self, space: spaces.Space):
 self.\_observation\_space = space

 @property
 def reward\_range(self) -> Tuple\[SupportsFloat, SupportsFloat\]:
 """Return the reward range of the environment."""
 if self.\_reward\_range is None:
 return self.env.reward\_range
 return self.\_reward\_range

 @reward\_range.setter
 def reward\_range(self, value: Tuple\[SupportsFloat, SupportsFloat\]):
 self.\_reward\_range = value

 @property
 def metadata(self) -> dict:
 """Returns the environment metadata."""
 if self.\_metadata is None:
 return self.env.metadata
 return self.\_metadata

 @metadata.setter
 def metadata(self, value):
 self.\_metadata = value

 @property
 def render\_mode(self) -> Optional\[str\]:
 """Returns the environment render\_mode."""
 return self.env.render\_mode

 @property
 def np\_random(self) -> np.random.Generator:
 """Returns the environment np\_random."""
 return self.env.np\_random

 @np\_random.setter
 def np\_random(self, value):
 self.env.np\_random = value

 @property
 def \_np\_random(self):
 raise AttributeError(
 "Can't access \`\_np\_random\` of a wrapper, use \`.unwrapped.\_np\_random\` or \`.np\_random\`."
 )

 def step(self, action: ActType) -> Tuple\[ObsType, float, bool, bool, dict\]:
 """Steps through the environment with action."""
 return self.env.step(action)

 def reset(self, \*\*kwargs) -> Tuple\[ObsType, dict\]:
 """Resets the environment with kwargs."""
 return self.env.reset(\*\*kwargs)

 def render(
 self, \*args, \*\*kwargs
 ) -\> Optional\[Union\[RenderFrame, List\[RenderFrame\]\]\]:
 """Renders the environment."""
 return self.env.render(\*args, \*\*kwargs)

 def close(self):
 """Closes the environment."""
 return self.env.close()

 def \_\_str\_\_(self):
 """Returns the wrapper name and the unwrapped environment string."""
 return f"<{type(self).\_\_name\_\_}{self.env}>"

 def \_\_repr\_\_(self):
 """Returns the string representation of the wrapper."""
 return str(self)

 @property
 def unwrapped(self) -> Env:
 """Returns the base environment of the wrapper."""
 return self.env.unwrapped

class ObservationWrapper(Wrapper):
 """Superclass of wrappers that can modify observations using :meth:\`observation\` for :meth:\`reset\` and :meth:\`step\`.

 If you would like to apply a function to the observation that is returned by the base environment before
 passing it to learning code, you can simply inherit from :class:\`ObservationWrapper\` and overwrite the method
 :meth:\`observation\` to implement that transformation. The transformation defined in that method must be
 defined on the base environment’s observation space. However, it may take values in a different space.
 In that case, you need to specify the new observation space of the wrapper by setting :attr:\`self.observation\_space\`
 in the :meth:\`\_\_init\_\_\` method of your wrapper.

 For example, you might have a 2D navigation task where the environment returns dictionaries as observations with
 keys \`\`"agent\_position"\`\` and \`\`"target\_position"\`\`. A common thing to do might be to throw away some degrees of
 freedom and only consider the position of the target relative to the agent, i.e.
 \`\`observation\["target\_position"\] - observation\["agent\_position"\]\`\`. For this, you could implement an
 observation wrapper like this::

 class RelativePosition(gym.ObservationWrapper):
 def \_\_init\_\_(self, env):
 super().\_\_init\_\_(env)
 self.observation\_space = Box(shape=(2,), low=-np.inf, high=np.inf)

 def observation(self, obs):
 return obs\["target"\] - obs\["agent"\]

 Among others, Gym provides the observation wrapper :class:\`TimeAwareObservation\`, which adds information about the
 index of the timestep to the observation.
 """

 def reset(self, \*\*kwargs):
 """Resets the environment, returning a modified observation using :meth:\`self.observation\`."""
 obs, info = self.env.reset(\*\*kwargs)
 return self.observation(obs), info

 def step(self, action):
 """Returns a modified observation using :meth:\`self.observation\` after calling :meth:\`env.step\`."""
 observation, reward, terminated, truncated, info = self.env.step(action)
 return self.observation(observation), reward, terminated, truncated, info

 def observation(self, observation):
 """Returns a modified observation."""
 raise NotImplementedError

class RewardWrapper(Wrapper):
 """Superclass of wrappers that can modify the returning reward from a step.

 If you would like to apply a function to the reward that is returned by the base environment before
 passing it to learning code, you can simply inherit from :class:\`RewardWrapper\` and overwrite the method
 :meth:\`reward\` to implement that transformation.
 This transformation might change the reward range; to specify the reward range of your wrapper,
 you can simply define :attr:\`self.reward\_range\` in :meth:\`\_\_init\_\_\`.

 Let us look at an example: Sometimes (especially when we do not have control over the reward
 because it is intrinsic), we want to clip the reward to a range to gain some numerical stability.
 To do that, we could, for instance, implement the following wrapper::

 class ClipReward(gym.RewardWrapper):
 def \_\_init\_\_(self, env, min\_reward, max\_reward):
 super().\_\_init\_\_(env)
 self.min\_reward = min\_reward
 self.max\_reward = max\_reward
 self.reward\_range = (min\_reward, max\_reward)

 def reward(self, reward):
 return np.clip(reward, self.min\_reward, self.max\_reward)
 """

 def step(self, action):
 """Modifies the reward using :meth:\`self.reward\` after the environment :meth:\`env.step\`."""
 observation, reward, terminated, truncated, info = self.env.step(action)
 return observation, self.reward(reward), terminated, truncated, info

 def reward(self, reward):
 """Returns a modified \`\`reward\`\`."""
 raise NotImplementedError

class ActionWrapper(Wrapper):
 """Superclass of wrappers that can modify the action before :meth:\`env.step\`.

 If you would like to apply a function to the action before passing it to the base environment,
 you can simply inherit from :class:\`ActionWrapper\` and overwrite the method :meth:\`action\` to implement
 that transformation. The transformation defined in that method must take values in the base environment’s
 action space. However, its domain might differ from the original action space.
 In that case, you need to specify the new action space of the wrapper by setting :attr:\`self.action\_space\` in
 the :meth:\`\_\_init\_\_\` method of your wrapper.

 Let’s say you have an environment with action space of type :class:\`gym.spaces.Box\`, but you would only like
 to use a finite subset of actions. Then, you might want to implement the following wrapper::

 class DiscreteActions(gym.ActionWrapper):
 def \_\_init\_\_(self, env, disc\_to\_cont):
 super().\_\_init\_\_(env)
 self.disc\_to\_cont = disc\_to\_cont
 self.action\_space = Discrete(len(disc\_to\_cont))

 def action(self, act):
 return self.disc\_to\_cont\[act\]

 if \_\_name\_\_ == "\_\_main\_\_":
 env = gym.make("LunarLanderContinuous-v2")
 wrapped\_env = DiscreteActions(env, \[np.array(\[1,0\]), np.array(\[-1,0\]),\
 np.array(\[0,1\]), np.array(\[0,-1\])\])
 print(wrapped\_env.action\_space) #Discrete(4)

 Among others, Gym provides the action wrappers :class:\`ClipAction\` and :class:\`RescaleAction\`.
 """

 def step(self, action):
 """Runs the environment :meth:\`env.step\` using the modified \`\`action\`\` from :meth:\`self.action\`."""
 return self.env.step(self.action(action))

 def action(self, action):
 """Returns a modified action before :meth:\`env.step\` is called."""
 raise NotImplementedError

 def reverse\_action(self, action):
 """Returns a reversed \`\`action\`\`."""
 raise NotImplementedError