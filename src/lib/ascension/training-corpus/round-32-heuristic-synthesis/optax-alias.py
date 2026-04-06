# Content from https://raw.githubusercontent.com/google-deepmind/optax/master/optax/_src/alias.py

\# Copyright 2019 DeepMind Technologies Limited. All Rights Reserved.
#
\# Licensed under the Apache License, Version 2.0 (the "License");
\# you may not use this file except in compliance with the License.
\# You may obtain a copy of the License at
#
\# http://www.apache.org/licenses/LICENSE-2.0
#
\# Unless required by applicable law or agreed to in writing, software
\# distributed under the License is distributed on an "AS IS" BASIS,
\# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
\# See the License for the specific language governing permissions and
\# limitations under the License.
\# ==============================================================================
"""Aliases for popular optimizers."""

from collections.abc import Callable
import functools
from typing import Any, Optional, Union
import warnings

import jax
import jax.numpy as jnp

from optax.\_src import base
from optax.\_src import combine
from optax.\_src import factorized
from optax.\_src import linesearch as \_linesearch
from optax.\_src import transform
from optax.\_src import wrappers
from optax.transforms import \_clipping

MaskOrFn = Optional\[Union\[Any, Callable\[\[base.Params\], Any\]\]\]

def adabelief(
 learning\_rate: base.ScalarOrSchedule,
 b1: jax.typing.ArrayLike = 0.9,
 b2: jax.typing.ArrayLike = 0.999,
 eps: jax.typing.ArrayLike = 1e-16,
 eps\_root: jax.typing.ArrayLike = 1e-16,
 \*,
 nesterov: bool = False,
) -\> base.GradientTransformationExtraArgs:
 r"""The AdaBelief optimizer.

 AdaBelief is an adaptive learning rate optimizer that focuses on fast
 convergence, generalization, and stability. It adapts the step size depending
 on its "belief" in the gradient direction — the optimizer adaptively scales
 the step size by the difference between the predicted and observed gradients.
 AdaBelief is a modified version of :func:\`optax.adam\` and contains the same
 number of parameters.

 Let :math:\`\\alpha\_t\` represent the learning rate and :math:\`\\beta\_1, \\beta\_2\`,
 :math:\`\\varepsilon\`, :math:\`\\bar{\\varepsilon}\` represent the arguments
 \`\`b1\`\`, \`\`b2\`\`, \`\`eps\`\` and \`\`eps\_root\`\` respectively. The learning rate is
 indexed by :math:\`t\` since the learning rate may also be provided by a
 schedule function.

 The \`\`init\`\` function of this optimizer initializes an internal state
 :math:\`S\_0 := (m\_0, s\_0) = (0, 0)\`, representing initial estimates for the
 first and second moments. In practice these values are stored as pytrees
 containing all zeros, with the same shape as the model updates.
 At step :math:\`t\`, the \`\`update\`\` function of this optimizer takes as
 arguments the incoming gradients :math:\`g\_t\` and optimizer state :math:\`S\_t\`
 and computes updates :math:\`u\_t\` and new state :math:\`S\_{t+1}\`. Thus, for
 :math:\`t > 0\`, we have,

 .. math::

 \\begin{align\*}
 m\_t &\\leftarrow \\beta\_1 \\cdot m\_{t-1} + (1-\\beta\_1) \\cdot g\_t \\\
 s\_t &\\leftarrow \\beta\_2 \\cdot s\_{t-1} + (1-\\beta\_2) \\cdot (g\_t - m\_t)^2
 \+ \\bar{\\varepsilon} \\\
 \\hat{m}\_t &\\leftarrow m\_t / {(1-\\beta\_1^t)} \\\
 \\hat{s}\_t &\\leftarrow s\_t / {(1-\\beta\_2^t)} \\\
 u\_t &\\leftarrow -\\alpha\_t \\cdot \\hat{m}\_t / \\left(\\sqrt{\\hat{s}\_t}
 \+ \\varepsilon \\right) \\\
 S\_t &\\leftarrow (m\_t, s\_t).
 \\end{align\*}

 With the keyword argument \`nesterov=True\`, the optimizer uses Nesterov
 momentum, replacing the above :math:\`\\hat{m}\_t\` with

 .. math::
 \\hat{m}\_t \\leftarrow
 \\beta\_1 m\_t / {(1-\\beta\_1^{t+1})} + (1 - \\beta\_1) g\_t / {(1-\\beta\_1^t)}.

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.
 b1: Exponential decay rate to track the first moment of past gradients.
 b2: Exponential decay rate to track the second moment of past gradients.
 eps: Term added to the denominator to improve numerical stability.
 eps\_root: Term added to the second moment of the prediction error to
 improve numerical stability. If backpropagating gradients through the
 gradient transformation (e.g. for meta-learning), this must be non-zero.
 nesterov: Whether to use Nesterov momentum.

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> def f(x): return jnp.sum(x \*\* 2) # simple quadratic function
 >>\> solver = optax.adabelief(learning\_rate=0.003)
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... grad = jax.grad(f)(params)
 ... updates, opt\_state = solver.update(grad, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... print('Objective function: {:.2E}'.format(f(params)))
 Objective function: 1.40E+01
 Objective function: 1.39E+01
 Objective function: 1.39E+01
 Objective function: 1.38E+01
 Objective function: 1.38E+01

 References:
 Zhuang, \`AdaBelief Optimizer: Adapting Stepsizes by the Belief in Observed
 Gradients \`\_, 2020

 .. note::
 The default epsilon values in the paper are \`\`eps=1e-8\`\`, \`\`eps\_root=0.\`\`.
 """
 return combine.chain(
 transform.scale\_by\_belief(
 b1=b1,
 b2=b2,
 eps=eps,
 eps\_root=eps\_root,
 nesterov=nesterov,
 ),
 transform.scale\_by\_learning\_rate(learning\_rate),
 )

def adadelta(
 learning\_rate: Optional\[base.ScalarOrSchedule\] = None,
 rho: jax.typing.ArrayLike = 0.9,
 eps: jax.typing.ArrayLike = 1e-6,
 weight\_decay: Union\[jax.typing.ArrayLike, base.ScalarOrSchedule\] = 0.0,
 weight\_decay\_mask: MaskOrFn = None,
) -\> base.GradientTransformationExtraArgs:
 r"""The Adadelta optimizer.

 Adadelta is a stochastic gradient descent method that adapts learning rates
 based on a moving window of gradient updates. Adadelta is a modification of
 Adagrad.
 It addresses the diminishing learning rates problem in Adagrad by maintaining running averages of squared
 gradients.

 The weight update :math:\`\\Delta w\_t\` for this optimizer is given as follows:

 .. math::
 \\begin{align\*}

 &E\[g^2\]\_t = \\rho \\cdot E\[g^2\]\_{t-1} + (1-\\rho) \\cdot g\_t^2 \\\
 &\\Delta w\_t = -\\frac{\\sqrt{E\[\\Delta w^2\]\_{t-1} + \\epsilon}}{\\sqrt{E\[g^2\]\_t + \\epsilon}} \\cdot g\_t

 \\end{align\*}

 where:
 \- :math:\`g\_t\` is the gradient at time step :math:\`t\`,
 \- :math:\`E\[g^2\]\_t\` is the running average of squared gradients,
 \- :math:\`E\[\\Delta w^2\]\_t\` is the running average of squared parameter updates,
 \- :math:\`\\rho\` is the decay rate (typically 0.9),
 \- :math:\`\\epsilon\` is a small constant for numerical stability.

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.
 rho: A coefficient used for computing a running average of squared
 gradients.
 eps: Term added to the denominator to improve numerical stability.
 weight\_decay: Optional rate at which to decay weights.
 weight\_decay\_mask: A tree with same structure as (or a prefix of) the params
 PyTree, or a Callable that returns such a pytree given the params/updates.
 The leaves should be booleans, \`True\` for leaves/subtrees you want to
 apply the transformation to, and \`False\` for those you want to skip.

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> f = lambda x: jnp.sum(x \*\* 2) # simple quadratic function
 >>\> solver = optax.adadelta(learning\_rate=10.)
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... grad = jax.grad(f)(params)
 ... updates, opt\_state = solver.update(grad, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... print('Objective function: {:.2E}'.format(f(params)))
 Objective function: 1.36E+01
 Objective function: 1.32E+01
 Objective function: 1.29E+01
 Objective function: 1.25E+01
 Objective function: 1.21E+01

 References:
 Zeiler, \`Adadelta: An Adaptive Learning Rate Optimizer
 \`\_, 2012
 """ # noqa: E501
 return combine.chain(
 transform.add\_decayed\_weights(weight\_decay, mask=weight\_decay\_mask),
 transform.scale\_by\_adadelta(rho=rho, eps=eps),
 transform.scale\_by\_learning\_rate(learning\_rate),
 )

def adafactor(
 learning\_rate: Optional\[base.ScalarOrSchedule\] = None,
 min\_dim\_size\_to\_factor: int = 128,
 decay\_rate: jax.typing.ArrayLike = 0.8,
 decay\_offset: jax.typing.ArrayLike = 0,
 multiply\_by\_parameter\_scale: bool = True,
 clipping\_threshold: Optional\[jax.typing.ArrayLike\] = 1.0,
 momentum: Optional\[jax.typing.ArrayLike\] = None, # float
 dtype\_momentum: jax.typing.DTypeLike = jnp.float32,
 weight\_decay\_rate: Optional\[base.ScalarOrSchedule\] = None,
 eps: jax.typing.ArrayLike = 1e-30,
 factored: bool = True,
 weight\_decay\_mask: MaskOrFn = None,
) -\> base.GradientTransformationExtraArgs:
 """The Adafactor optimizer.

 Adafactor is an adaptive learning rate optimizer that focuses on fast
 training of large scale neural networks. It saves memory by using a factored
 estimate of the second order moments used to scale gradients.

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.
 Note that the natural scale for Adafactor's LR is markedly different
 from Adam, one doesn't use the 1/sqrt(hidden) correction for this optim
 with attention-based models.
 min\_dim\_size\_to\_factor: Only factor the statistics if two array dimensions
 have at least this size.
 decay\_rate: Controls second-moment exponential decay schedule.
 decay\_offset: For fine-tuning, one may set this to the starting step
 number of the fine-tuning phase.
 multiply\_by\_parameter\_scale: If True, then scale learning\_rate by
 parameter norm. If False, provided learning\_rate is absolute step size.
 clipping\_threshold: Optional clipping threshold. Must be >= 1. If None,
 clipping is disabled.
 momentum: Optional value between 0 and 1, enables momentum and uses extra
 memory if non-None! None by default.
 dtype\_momentum: Data type of momentum buffers.
 weight\_decay\_rate: Optional rate at which to decay weights.
 eps: Regularization constant for root mean squared gradient.
 factored: Whether to use factored second-moment estimates.
 weight\_decay\_mask: A tree with same structure as (or a prefix of) the
 params PyTree, or a Callable that returns such a pytree given the
 params/updates. The leaves should be booleans, \`True\` for
 leaves/subtrees you want to apply the transformation to, and \`False\` for
 those you want to skip.

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> def f(x): return jnp.sum(x \*\* 2) # simple quadratic function
 >>\> solver = optax.adafactor(learning\_rate=0.003)
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... grad = jax.grad(f)(params)
 ... updates, opt\_state = solver.update(grad, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... print('Objective function: {:.2E}'.format(f(params)))
 Objective function: 1.39E+01
 Objective function: 1.38E+01
 Objective function: 1.38E+01
 Objective function: 1.37E+01
 Objective function: 1.36E+01

 References:
 Shazeer et al, \`Adafactor: Adaptive Learning Rates with Sublinear Memory
 Cost \`\_, 2018
 """
 # The core of the algorithm is a procedure for rescaling gradients
 # by a factored estimate of the root mean squared gradients.
 # This reduces memory compared to algorithms such as Adam or RmsProp,
 # by not having to hold a separate estimate for each weight.
 tx = \[\
 factorized.scale\_by\_factored\_rms(\
 factored, decay\_rate, decay\_offset, min\_dim\_size\_to\_factor, eps\
 )\
 \]
 # This basic rescaling is typically combined with one or more of the following
 # transformation (all can be disabled via adafactor's constructor args).
 if clipping\_threshold is not None:
 tx.append(\_clipping.clip\_by\_block\_rms(clipping\_threshold))
 if learning\_rate is not None:
 tx.append(transform.scale\_by\_learning\_rate(learning\_rate, flip\_sign=False))
 if multiply\_by\_parameter\_scale:
 tx.append(transform.scale\_by\_param\_block\_rms())
 if momentum is not None:
 tx.append(
 transform.ema(momentum, debias=False, accumulator\_dtype=dtype\_momentum)
 )
 if weight\_decay\_rate is not None:
 tx.append(
 transform.add\_decayed\_weights(weight\_decay\_rate, mask=weight\_decay\_mask)
 )
 # In gradient "descent" we follow the negative gradient.
 tx.append(transform.scale(-1))
 return combine.chain(\*tx)

def adagrad(
 learning\_rate: base.ScalarOrSchedule,
 initial\_accumulator\_value: jax.typing.ArrayLike = 0.1,
 eps: jax.typing.ArrayLike = 1e-7,
) -\> base.GradientTransformationExtraArgs:
 r"""The Adagrad optimizer.

 AdaGrad is a sub-gradient algorithm for stochastic optimization that adapts
 the learning rate individually for each feature based on its gradient history.

 The updated parameters adopt the form:

 .. math::

 w\_{t+1}^{(i)} = w\_{t}^{(i)} - \\eta \\frac{g\_{t}^{(i)}}
 {\\sqrt{\\sum\_{\\tau=1}^{t} (g\_{\\tau}^{(i)})^2 + \\epsilon}}

 where:
 \- :math:\`w\_t^{(i)}\` is the parameter :math:\`i\` at time step :math:\`t\`,
 \- :math:\`\\eta\` is the learning rate,
 \- :math:\`g\_t^{(i)}\` is the gradient of parameter :math:\`i\` at time step
 :math:\`t\`,
 \- :math:\`\\epsilon\` is a small constant to ensure numerical stability.

 Defining :math:\`G = \\sum\_{t=1}^\\tau g\_t g\_t^\\top\`, the update can be
 written as

 .. math::

 w\_{t+1} = w\_{t} - \\eta \\cdot \\text{diag}(G + \\epsilon I)^{-1/2}
 \\cdot g\_t

 where :math:\`\\text{diag} (G) = (G\_{ii})\_{i=1}^p\` is the vector of diagonal
 entries of :math:\`G \\in \\mathbb{R}^p\` and :math:\`I\` is the identity matrix
 in :math:\`\\mathbb{R}^p\`.

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.
 initial\_accumulator\_value: Initial value for the accumulator.
 eps: A small constant applied to denominator inside of the square root (as
 in RMSProp) to avoid dividing by zero when rescaling.

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> def f(x): return jnp.sum(x \*\* 2) # simple quadratic function
 >>\> solver = optax.adagrad(learning\_rate=1.0)
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... grad = jax.grad(f)(params)
 ... updates, opt\_state = solver.update(grad, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... print('Objective function: {:.2E}'.format(f(params)))
 Objective function: 5.01E+00
 Objective function: 2.40E+00
 Objective function: 1.25E+00
 Objective function: 6.86E-01
 Objective function: 3.85E-01

 References:
 Duchi et al, \`Adaptive Subgradient Methods for Online Learning and
 Stochastic Optimization \`\_,
 2011

 .. warning::
 Adagrad's main limit is the monotonic accumulation of squared
 gradients in the denominator: since all terms are >0, the sum keeps growing
 during training and the learning rate eventually becomes vanishingly small.
 """
 return combine.chain(
 transform.scale\_by\_rss(
 initial\_accumulator\_value=initial\_accumulator\_value, eps=eps
 ),
 transform.scale\_by\_learning\_rate(learning\_rate),
 )

def adam(
 learning\_rate: base.ScalarOrSchedule,
 b1: jax.typing.ArrayLike = 0.9,
 b2: jax.typing.ArrayLike = 0.999,
 eps: jax.typing.ArrayLike = 1e-8,
 eps\_root: jax.typing.ArrayLike = 0.0,
 mu\_dtype: Optional\[Any\] = None,
 \*,
 nesterov: bool = False,
) -\> base.GradientTransformationExtraArgs:
 r"""The Adam optimizer.

 Adam is an SGD variant with gradient scaling adaptation. The scaling
 used for each parameter is computed from estimates of first and second-order
 moments of the gradients (using suitable exponential moving averages).

 Let :math:\`\\alpha\_t\` represent the learning rate and :math:\`\\beta\_1, \\beta\_2\`,
 :math:\`\\varepsilon\`, :math:\`\\bar{\\varepsilon}\` represent the arguments
 \`\`b1\`\`, \`\`b2\`\`, \`\`eps\`\` and \`\`eps\_root\`\` respectively. The learning rate is
 indexed by :math:\`t\` since the learning rate may also be provided by a
 schedule function.

 The \`\`init\`\` function of this optimizer initializes an internal state
 :math:\`S\_0 := (m\_0, v\_0) = (0, 0)\`, representing initial estimates for the
 first and second moments. In practice these values are stored as pytrees
 containing all zeros, with the same shape as the model updates.
 At step :math:\`t\`, the \`\`update\`\` function of this optimizer takes as
 arguments the incoming gradients :math:\`g\_t\` and optimizer state :math:\`S\_t\`
 and computes updates :math:\`u\_t\` and new state :math:\`S\_{t+1}\`. Thus, for
 :math:\`t > 0\`, we have,

 .. math::

 \\begin{align\*}
 m\_t &\\leftarrow \\beta\_1 \\cdot m\_{t-1} + (1-\\beta\_1) \\cdot g\_t \\\
 v\_t &\\leftarrow \\beta\_2 \\cdot v\_{t-1} + (1-\\beta\_2) \\cdot {g\_t}^2 \\\
 \\hat{m}\_t &\\leftarrow m\_t / {(1-\\beta\_1^t)} \\\
 \\hat{v}\_t &\\leftarrow v\_t / {(1-\\beta\_2^t)} \\\
 u\_t &\\leftarrow -\\alpha\_t \\cdot \\hat{m}\_t / \\left({\\sqrt{\\hat{v}\_t +
 \\bar{\\varepsilon}} + \\varepsilon} \\right)\\\
 S\_t &\\leftarrow (m\_t, v\_t).
 \\end{align\*}

 With the keyword argument \`nesterov=True\`, the optimizer uses Nesterov
 momentum, replacing the above :math:\`\\hat{m}\_t\` with

 .. math::
 \\hat{m}\_t \\leftarrow
 \\beta\_1 m\_t / {(1-\\beta\_1^{t+1})} + (1 - \\beta\_1) g\_t / {(1-\\beta\_1^t)}.

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.
 b1: Exponential decay rate to track the first moment of past gradients.
 b2: Exponential decay rate to track the second moment of past gradients.
 eps: A small constant applied to denominator outside of the square root
 (as in the Adam paper) to avoid dividing by zero when rescaling.
 eps\_root: A small constant applied to denominator inside the square root (as
 in RMSProp), to avoid dividing by zero when rescaling. This is needed for
 example when computing (meta-)gradients through Adam.
 mu\_dtype: Optional \`dtype\` to be used for the first order accumulator; if
 \`None\` then the \`dtype\` is inferred from \`params\` and \`updates\`.
 nesterov: Whether to use Nesterov momentum. The solver with
 nesterov=True is equivalent to the :func:\`optax.nadam\` optimizer, and
 described in \[Dozat 2016\].

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> def f(x): return jnp.sum(x \*\* 2) # simple quadratic function
 >>\> solver = optax.adam(learning\_rate=0.003)
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... grad = jax.grad(f)(params)
 ... updates, opt\_state = solver.update(grad, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... print('Objective function: {:.2E}'.format(f(params)))
 Objective function: 1.40E+01
 Objective function: 1.39E+01
 Objective function: 1.39E+01
 Objective function: 1.39E+01
 Objective function: 1.38E+01

 References:
 Kingma et al, \`Adam: A Method for Stochastic Optimization
 \`\_, 2014

 Dozat, \`Incorporating Nesterov Momentum into Adam
 \`\_, 2016

 .. warning::
 PyTorch and optax's implementation follow Algorithm 1 of \[Kingma et al.\
 2014\]. Note that TensorFlow used instead the formulation just before Section
 2.1 of the paper. See https://github.com/deepmind/optax/issues/571 for more
 detail.

 .. seealso:: :func:\`optax.nadam\`, :func:\`optax.adamw\`.
 """
 return combine.chain(
 transform.scale\_by\_adam(
 b1=b1,
 b2=b2,
 eps=eps,
 eps\_root=eps\_root,
 mu\_dtype=mu\_dtype,
 nesterov=nesterov,
 ),
 transform.scale\_by\_learning\_rate(learning\_rate),
 )

nadam = functools.partial(adam, nesterov=True)
nadam.\_\_doc\_\_ = r"""The NAdam optimizer.

 Nadam is a variant of :func:\`optax.adam\` with Nesterov's momentum. The update
 rule of this solver is as follows:

 .. math::

 \\begin{align\*}
 m\_t &\\leftarrow \\beta\_1 \\cdot m\_{t-1} + (1-\\beta\_1) \\cdot g\_t \\\
 v\_t &\\leftarrow \\beta\_2 \\cdot v\_{t-1} + (1-\\beta\_2) \\cdot {g\_t}^2 \\\
 \\hat{m}\_t &\\leftarrow
 \\beta\_1 m\_t / {(1-\\beta\_1^{t+1})} + (1 - \\beta\_1) g\_t / {(1-\\beta\_1^t)}\\\
 \\hat{v}\_t &\\leftarrow v\_t / {(1-\\beta\_2^t)} \\\
 u\_t &\\leftarrow -\\alpha\_t \\cdot \\hat{m}\_t / \\left({\\sqrt{\\hat{v}\_t +
 \\bar{\\varepsilon}} + \\varepsilon} \\right)\\\
 S\_t &\\leftarrow (m\_t, v\_t).
 \\end{align\*}

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.
 b1: Exponential decay rate to track the first moment of past gradients.
 b2: Exponential decay rate to track the second moment of past gradients.
 eps: A small constant applied to denominator outside of the square root
 (as in the Adam paper) to avoid dividing by zero when rescaling.
 eps\_root: A small constant applied to denominator inside the square root (as
 in RMSProp), to avoid dividing by zero when rescaling. This is needed for
 example when computing (meta-)gradients through Adam.
 mu\_dtype: Optional \`dtype\` to be used for the first order accumulator; if
 \`None\` then the \`dtype\` is inferred from \`params\` and \`updates\`.

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> def f(x): return jnp.sum(x \*\* 2) # simple quadratic function
 >>\> solver = optax.nadam(learning\_rate=0.003)
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... grad = jax.grad(f)(params)
 ... updates, opt\_state = solver.update(grad, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... print('Objective function: {:.2E}'.format(f(params)))
 Objective function: 1.39E+01
 Objective function: 1.39E+01
 Objective function: 1.39E+01
 Objective function: 1.38E+01
 Objective function: 1.38E+01

 References:
 Dozat, \`Incorporating Nesterov Momentum into Adam
 \`\_, 2016

 .. seealso:: :func:\`optax.adam\`, :func:\`optax.nadamw\`.

 .. versionadded:: 0.1.9
"""

def adamw(
 learning\_rate: base.ScalarOrSchedule,
 b1: jax.typing.ArrayLike = 0.9,
 b2: jax.typing.ArrayLike = 0.999,
 eps: jax.typing.ArrayLike = 1e-8,
 eps\_root: jax.typing.ArrayLike = 0.0,
 mu\_dtype: Optional\[Any\] = None,
 weight\_decay: base.ScalarOrSchedule = 1e-4,
 mask: Optional\[Union\[Any, Callable\[\[base.Params\], Any\]\]\] = None,
 \*,
 nesterov: bool = False,
) -\> base.GradientTransformationExtraArgs:
 r"""Adam with weight decay regularization.

 AdamW uses weight decay to regularize learning towards small weights, as
 this leads to better generalization. In SGD you can also use L2 regularization
 to implement this as an additive loss term, however L2 regularization
 does not behave as intended for adaptive gradient algorithms such as Adam,
 see \[Loshchilov et al, 2019\].

 Let :math:\`\\alpha\_t\` represent the learning rate and :math:\`\\beta\_1, \\beta\_2\`,
 :math:\`\\varepsilon\`, :math:\`\\bar{\\varepsilon}\` represent the arguments
 \`\`b1\`\`, \`\`b2\`\`, \`\`eps\`\` and \`\`eps\_root\`\` respectively. The learning rate is
 indexed by :math:\`t\` since the learning rate may also be provided by a
 schedule function. Let :math:\`\\lambda\` be the weight decay and
 :math:\`\\theta\_t\` the parameter vector at time :math:\`t\`.

 The \`\`init\`\` function of this optimizer initializes an internal state
 :math:\`S\_0 := (m\_0, v\_0) = (0, 0)\`, representing initial estimates for the
 first and second moments. In practice these values are stored as pytrees
 containing all zeros, with the same shape as the model updates.
 At step :math:\`t\`, the \`\`update\`\` function of this optimizer takes as
 arguments the incoming gradients :math:\`g\_t\`, the optimizer state :math:\`S\_t\`
 and the parameters :math:\`\\theta\_t\` and computes updates :math:\`u\_t\` and
 new state :math:\`S\_{t+1}\`. Thus, for :math:\`t > 0\`, we have,

 .. math::

 \\begin{align\*}
 m\_t &\\leftarrow \\beta\_1 \\cdot m\_{t-1} + (1-\\beta\_1) \\cdot g\_t \\\
 v\_t &\\leftarrow \\beta\_2 \\cdot v\_{t-1} + (1-\\beta\_2) \\cdot {g\_t}^2 \\\
 \\hat{m}\_t &\\leftarrow m\_t / {(1-\\beta\_1^t)} \\\
 \\hat{v}\_t &\\leftarrow v\_t / {(1-\\beta\_2^t)} \\\
 u\_t &\\leftarrow -\\alpha\_t \\cdot \\left( \\hat{m}\_t / \\left({\\sqrt{\\hat{v}\_t
 \+ \\bar{\\varepsilon}} + \\varepsilon} \\right) + \\lambda \\theta\_{t} \\right)\\\
 S\_t &\\leftarrow (m\_t, v\_t).
 \\end{align\*}

 This implementation can incorporate a momentum a la Nesterov introduced by
 \[Dozat 2016\]. The resulting optimizer is then often referred as NAdamW.
 With the keyword argument \`nesterov=True\`, the optimizer uses Nesterov
 momentum, replacing the above :math:\`\\hat{m}\_t\` with

 .. math::
 \\hat{m}\_t \\leftarrow
 \\beta\_1 m\_t / {(1-\\beta\_1^{t+1})} + (1 - \\beta\_1) g\_t / {(1-\\beta\_1^t)}.

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.
 b1: Exponential decay rate to track the first moment of past gradients.
 b2: Exponential decay rate to track the second moment of past gradients.
 eps: A small constant applied to denominator outside of the square root
 (as in the Adam paper) to avoid dividing by zero when rescaling.
 eps\_root: A small constant applied to denominator inside the square root (as
 in RMSProp), to avoid dividing by zero when rescaling. This is needed for
 instance when computing (meta-)gradients through Adam.
 mu\_dtype: Optional \`dtype\` to be used for the first order accumulator; if
 \`None\` then the \`dtype\` is inferred from \`params\` and \`updates\`.
 weight\_decay: Strength of the weight decay regularization. Note that this
 weight decay is multiplied with the learning rate. This is consistent
 with other frameworks such as PyTorch, but different from
 (Loshchilov et al, 2019) where the weight decay is only multiplied with
 the "schedule multiplier", but not the base learning rate.
 mask: A tree with same structure as (or a prefix of) the params PyTree,
 or a Callable that returns such a pytree given the params/updates.
 The leaves should be booleans, \`True\` for leaves/subtrees you want to
 apply the weight decay to, and \`False\` for those you want to skip. Note
 that the Adam gradient transformations are applied to all parameters.
 nesterov: Whether to use Nesterov momentum. The solver with
 nesterov=True is equivalent to the :func:\`optax.nadamw\` optimizer. This
 modification is described in \[Dozat 2016\].

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> def f(x): return jnp.sum(x \*\* 2) # simple quadratic function
 >>\> solver = optax.adamw(learning\_rate=0.003)
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... grad = jax.grad(f)(params)
 ... updates, opt\_state = solver.update(grad, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... print('Objective function: {:.2E}'.format(f(params)))
 Objective function: 1.40E+01
 Objective function: 1.39E+01
 Objective function: 1.39E+01
 Objective function: 1.39E+01
 Objective function: 1.38E+01

 References:
 Loshchilov et al, \`Decoupled Weight Decay
 Regularization \`\_, 2019

 Dozat, \`Incorporating Nesterov Momentum into Adam
 \`\_, 2016

 .. seealso::
 See the related functions :func:\`optax.adam\`, :func:\`optax.nadamw\`, as well
 as the example :doc:\`../\_collections/examples/nanolm\` for a use case.
 """
 return combine.chain(
 transform.scale\_by\_adam(
 b1=b1,
 b2=b2,
 eps=eps,
 eps\_root=eps\_root,
 mu\_dtype=mu\_dtype,
 nesterov=nesterov,
 ),
 transform.add\_decayed\_weights(weight\_decay, mask),
 transform.scale\_by\_learning\_rate(learning\_rate),
 )

nadamw = functools.partial(adamw, nesterov=True)
nadamw.\_\_doc\_\_ = (
 r"""NAdamW optimizer, implemented as part of the AdamW optimizer.

 NadamW is variant of :func:\`optax.adamw\` with Nesterov's momentum. Compared
 to AdamW, this optimizer replaces the assignment

 .. math::

 \\hat{m}\_t \\leftarrow m\_t / {(1-\\beta\_1^t)}

 with

 .. math::

 \\hat{m}\_t \\leftarrow
 \\beta\_1 m\_t / {(1-\\beta\_1^{t+1})} + (1 - \\beta\_1) g\_t / {(1-\\beta\_1^t)}.

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.
 b1: Exponential decay rate to track the first moment of past gradients.
 b2: Exponential decay rate to track the second moment of past gradients.
 eps: A small constant applied to denominator outside of the square root
 (as in the Adam paper) to avoid dividing by zero when rescaling.
 eps\_root: A small constant applied to denominator inside the square root (as
 in RMSProp), to avoid dividing by zero when rescaling. This is needed for
 instance when computing (meta-)gradients through Adam.
 mu\_dtype: Optional \`dtype\` to be used for the first order accumulator; if
 \`None\` then the \`dtype\` is inferred from \`params\` and \`updates\`.
 weight\_decay: Strength of the weight decay regularization. Note that this
 weight decay is multiplied with the learning rate. This is consistent
 with other frameworks such as PyTorch, but different from
 (Loshchilov et al, 2019) where the weight decay is only multiplied with
 the "schedule multiplier", but not the base learning rate.
 mask: A tree with same structure as (or a prefix of) the params PyTree,
 or a Callable that returns such a pytree given the params/updates.
 The leaves should be booleans, \`True\` for leaves/subtrees you want to
 apply the weight decay to, and \`False\` for those you want to skip. Note
 that the Adam gradient transformations are applied to all parameters.

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> def f(x): return jnp.sum(x \*\* 2) # simple quadratic function
 >>\> solver = optax.nadamw(learning\_rate=0.003)
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... grad = jax.grad(f)(params)
 ... updates, opt\_state = solver.update(grad, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... print('Objective function: {:.2E}'.format(f(params)))
 Objective function: 1.39E+01
 Objective function: 1.39E+01
 Objective function: 1.39E+01
 Objective function: 1.38E+01
 Objective function: 1.38E+01

 References:
 Loshchilov et al, \`Decoupled Weight Decay
 Regularization \`\_, 2019

 Dozat, \`Incorporating Nesterov Momentum into Adam
 \`\_, 2016

 .. seealso:: :func:\`optax.adam\`, :func:\`optax.adamw\`.

 .. versionadded:: 0.1.9
"""
)

def adan(
 learning\_rate: base.ScalarOrSchedule,
 b1: jax.typing.ArrayLike = 0.98,
 b2: jax.typing.ArrayLike = 0.92,
 b3: jax.typing.ArrayLike = 0.99,
 eps: jax.typing.ArrayLike = 1e-8,
 eps\_root: jax.typing.ArrayLike = 1e-8,
 weight\_decay: base.ScalarOrSchedule = 0.0,
 mask: Optional\[Union\[Any, Callable\[\[base.Params\], Any\]\]\] = None,
) -\> base.GradientTransformationExtraArgs:
 r"""The ADAptive Nesterov momentum algorithm (Adan).

 Adan first reformulates the vanilla Nesterov acceleration to develop a new
 Nesterov momentum estimation (NME) method, which avoids the extra overhead of
 computing gradient at the extrapolation point. Then Adan adopts NME to
 estimate the gradient's first- and second-order moments in adaptive gradient
 algorithms for convergence acceleration.

 The algorithm is as follows. First, we define the following parameters:

 \- :math:\`\\eta > 0\`: the step size.
 \- :math:\`\\beta\_1 \\in \[0, 1\]\`: the decay rate for the exponentially weighted
 average of gradients.
 \- :math:\`\\beta\_2 \\in \[0, 1\]\`: the decay rate for the exponentially weighted
 average of differences of gradients.
 \- :math:\`\\beta\_3 \\in \[0, 1\]\`: the decay rate for the exponentially weighted
 average of the squared term.
 \- :math:\`\\varepsilon > 0\`: a small constant for numerical stability.
 \- :math:\`\\lambda > 0\`: a weight decay.

 Second, we define the following variables:

 \- :math:\`\\theta\_t\`: the parameters.
 \- :math:\`g\_t\`: the incoming stochastic gradient.
 \- :math:\`m\_t\`: the exponentially weighted average of gradients.
 \- :math:\`v\_t\`: the exponentially weighted average of differences of gradients.
 \- :math:\`n\_t\`: the exponentially weighted average of the squared term.
 \- :math:\`u\_t\`: the outgoing update vector.
 \- :math:\`S\_t\`: the saved state of the optimizer.

 Third, we initialize these variables as follows:

 \- :math:\`m\_0 = g\_0\`
 \- :math:\`v\_0 = 0\`
 \- :math:\`v\_1 = g\_1 - g\_0\`
 \- :math:\`n\_0 = g\_0^2\`

 Finally, on each iteration, we update the variables as follows:

 .. math::

 \\begin{align\*}
 m\_t &\\gets (1 - \\beta\_1) m\_{t-1} + \\beta\_1 g\_t \\\
 v\_t &\\gets (1 - \\beta\_2) v\_{t-1} + \\beta\_2 (g\_t - g\_{t-1}) \\\
 n\_t &\\gets (1 - \\beta\_3) n\_{t-1} + \\beta\_3 (g\_t + (1 - \\beta\_2)
 (g\_t - g\_{t-1}))^2 \\\
 \\eta\_t &\\gets \\eta / ({\\sqrt{n\_t + \\bar{\\varepsilon}} + \\varepsilon}) \\\
 u\_t &\\gets (\\theta\_t - \\eta\_t \\circ (m\_t + (1 - \\beta\_2) v\_t))
 / (1 + \\lambda \\eta) \\\
 S\_t &\\leftarrow (m\_t, v\_t, n\_t).
 \\end{align\*}

 Args:
 learning\_rate: this is a fixed global scaling factor.
 b1: Decay rate for the EWMA of gradients.
 b2: Decay rate for the EWMA of differences of gradients.
 b3: Decay rate for the EMWA of the algorithm's squared term.
 eps: Term added to the denominator to improve numerical stability.
 eps\_root: Term added to the denominator inside the square-root to improve
 numerical stability when backpropagating gradients through the rescaling.
 weight\_decay: Strength of the weight decay regularization.
 mask: A tree with same structure as (or a prefix of) the params PyTree,
 or a Callable that returns such a pytree given the params/updates.
 The leaves should be booleans, \`True\` for leaves/subtrees you want to
 apply the weight decay to, and \`False\` for those you want to skip.

 Returns:
 the corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> f = lambda x: x @ x # simple quadratic function
 >>\> solver = optax.adan(learning\_rate=1e-1)
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... grad = jax.grad(f)(params)
 ... updates, opt\_state = solver.update(grad, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... print('Objective function: {:.2E}'.format(f(params)))
 Objective function: 1.28E+01
 Objective function: 1.17E+01
 Objective function: 1.07E+01
 Objective function: 9.68E+00
 Objective function: 8.76E+00

 References:
 Xie et al, \`Adan: Adaptive Nesterov Momentum Algorithm for Faster Optimizing
 Deep Models
 \`\_, 2022
 """
 return combine.chain(
 transform.scale\_by\_adan(
 b1=b1,
 b2=b2,
 b3=b3,
 eps=eps,
 eps\_root=eps\_root,
 ),
 transform.add\_decayed\_weights(weight\_decay, mask),
 transform.scale\_by\_learning\_rate(learning\_rate),
 )

def lion(
 learning\_rate: base.ScalarOrSchedule,
 b1: jax.typing.ArrayLike = 0.9,
 b2: jax.typing.ArrayLike = 0.99,
 mu\_dtype: Optional\[Any\] = None,
 weight\_decay: base.ScalarOrSchedule = 1e-3,
 mask: Optional\[Union\[Any, Callable\[\[base.Params\], Any\]\]\] = None,
) -\> base.GradientTransformationExtraArgs:
 r"""The Lion optimizer.

 Lion is discovered by symbolic program search. Unlike most adaptive optimizers
 such as AdamW, Lion only tracks momentum, making it more memory-efficient.
 The update of Lion is produced through the sign operation, resulting in a
 larger norm compared to updates produced by other optimizers such as SGD and
 AdamW. A suitable learning rate for Lion is typically 3-10x smaller than that
 for AdamW, the weight decay for Lion should be in turn 3-10x larger than that
 for AdamW to maintain a similar strength (lr \* wd).

 Let :math:\`\\alpha\_t\` represent the learning rate and :math:\`\\beta\_1, \\beta\_2\`,
 represent the arguments \`\`b1\`\` and \`\`b2\`\` respectively. The learning rate is
 indexed by :math:\`t\` since the learning rate may also be provided by a
 schedule function. Let :math:\`\\lambda\` be the weight decay and
 :math:\`\\theta\_t\` the parameter vector at time :math:\`t\`.

 The \`\`init\`\` function of this optimizer initializes an internal state
 :math:\`S\_0 := (m\_0) = (0)\`, representing the intial estimate for the
 first moment. In practice these values are stored as pytrees
 containing all zeros, with the same shape as the model updates.
 At step :math:\`t\`, the \`\`update\`\` function of this optimizer takes as
 arguments the incoming gradients :math:\`g\_t\`, the optimizer state :math:\`S\_t\`
 and the parameters :math:\`\\theta\_t\` and computes updates :math:\`u\_t\` and
 new state :math:\`S\_{t+1}\`. Thus, for :math:\`t > 0\`, we have,

 .. math::

 \\begin{align\*}
 c\_t &\\leftarrow \\beta\_1 \\cdot m\_{t-1} + (1-\\beta\_1) \\cdot g\_t \\\
 u\_t &\\leftarrow -\\alpha\_t \\cdot \\left( sign \\left( c\_t \\right) +
 \\lambda \\theta\_{t} \\right)\\\
 m\_t &\\leftarrow \\beta\_2 \\cdot m\_{t-1} + (1-\\beta\_2) \\cdot g\_t \\\
 S\_t &\\leftarrow (m\_t).
 \\end{align\*}

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.
 b1: Rate to combine the momentum and the current gradient.
 b2: Exponential decay rate to track the momentum of past gradients.
 mu\_dtype: Optional \`dtype\` to be used for the first order accumulator; if
 \`None\` then the \`dtype\` is inferred from \`params\` and \`updates\`.
 weight\_decay: Strength of the weight decay regularization. Note that this
 weight decay is multiplied with the learning rate. This is consistent with
 other frameworks such as PyTorch, but different from (Loshchilov et al,
 2019) where the weight decay is only multiplied with the "schedule
 multiplier", but not the base learning rate.
 mask: A tree with same structure as (or a prefix of) the params PyTree, or a
 Callable that returns such a pytree given the params/updates. The leaves
 should be booleans, \`True\` for leaves/subtrees you want to apply the
 weight decay to, and \`False\` for those you want to skip. Note that the
 Adam gradient transformations are applied to all parameters.

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> def f(x): return jnp.sum(x \*\* 2) # simple quadratic function
 >>\> solver = optax.lion(learning\_rate=0.003)
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... grad = jax.grad(f)(params)
 ... updates, opt\_state = solver.update(grad, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... print('Objective function: {:.2E}'.format(f(params)))
 Objective function: 1.40E+01
 Objective function: 1.39E+01
 Objective function: 1.39E+01
 Objective function: 1.39E+01
 Objective function: 1.38E+01

 References:
 Chen et al, \`Symbolic Discovery of Optimization Algorithms
 \`\_, 2023
 """
 return combine.chain(
 transform.scale\_by\_lion(b1=b1, b2=b2, mu\_dtype=mu\_dtype),
 transform.add\_decayed\_weights(weight\_decay, mask),
 transform.scale\_by\_learning\_rate(learning\_rate),
 )

def amsgrad(
 learning\_rate: base.ScalarOrSchedule,
 b1: jax.typing.ArrayLike = 0.9,
 b2: jax.typing.ArrayLike = 0.999,
 eps: jax.typing.ArrayLike = 1e-8,
 eps\_root: jax.typing.ArrayLike = 0.0,
 mu\_dtype: Optional\[Any\] = None,
 bias\_correction\_mu: bool = True,
 bias\_correction\_nu: bool = True,
) -\> base.GradientTransformationExtraArgs:
 """The AMSGrad optimizer.

 The original Adam can fail to converge to the optimal solution in some cases.
 AMSGrad guarantees convergence by using a long-term memory of past gradients.

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.
 b1: Exponential decay rate to track the first moment of past gradients.
 b2: Exponential decay rate to track the second moment of past gradients.
 eps: A small constant applied to denominator outside of the square root (as
 in the Adam paper) to avoid dividing by zero when rescaling.
 eps\_root: A small constant applied to denominator inside the square root (as
 in RMSProp), to avoid dividing by zero when rescaling. This is needed for
 instance when computing (meta-)gradients through Adam.
 mu\_dtype: Optional \`dtype\` to be used for the first order accumulator; if
 \`None\` then the \`dtype\` is inferred from \`params\` and \`updates\`.
 bias\_correction\_mu: Whether to apply bias correction to the first moment
 estimate. Set to \`\`False\`\` to match the original AMSGrad paper.
 bias\_correction\_nu: Whether to apply bias correction to the second moment
 estimate before taking the elementwise maximum (\`\`nu\_max\`\`). Set to
 \`\`False\`\` to match the original AMSGrad paper.

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> def f(x): return jnp.sum(x \*\* 2) # simple quadratic function
 >>\> solver = optax.amsgrad(learning\_rate=0.003)
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... grad = jax.grad(f)(params)
 ... updates, opt\_state = solver.update(grad, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... print('Objective function: {:.2E}'.format(f(params)))
 Objective function: 1.40E+01
 Objective function: 1.39E+01
 Objective function: 1.39E+01
 Objective function: 1.39E+01
 Objective function: 1.38E+01

 References:
 Reddi et al, \`On the Convergence of Adam and Beyond
 \`\_, 2023
 """
 return combine.chain(
 transform.scale\_by\_amsgrad(
 b1=b1,
 b2=b2,
 eps=eps,
 eps\_root=eps\_root,
 mu\_dtype=mu\_dtype,
 bias\_correction\_mu=bias\_correction\_mu,
 bias\_correction\_nu=bias\_correction\_nu,
 ),
 transform.scale\_by\_learning\_rate(learning\_rate),
 )

def fromage(
 learning\_rate: base.ScalarOrSchedule, min\_norm: jax.typing.ArrayLike = 1e-6
) -\> base.GradientTransformationExtraArgs:
 """The Frobenius matched gradient descent (Fromage) optimizer.

 Fromage is a learning algorithm that does not require learning rate tuning.
 The optimizer is based on modeling neural network gradients via deep relative
 trust (a distance function on deep neural networks). Fromage is similar to the
 LARS optimizer and can work on a range of standard neural network benchmarks,
 such as natural language Transformers and generative adversarial networks.

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.
 min\_norm: A minimum value that the norm of the gradient updates and the norm
 of the layer parameters can be clipped to to avoid dividing by zero when
 computing the trust ratio (as in the LARS paper).

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> def f(x): return jnp.sum(x \*\* 2) # simple quadratic function
 >>\> solver = optax.fromage(learning\_rate=0.003)
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... grad = jax.grad(f)(params)
 ... updates, opt\_state = solver.update(grad, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... print('Objective function: {:.2E}'.format(f(params)))
 Objective function: 1.39E+01
 Objective function: 1.38E+01
 Objective function: 1.37E+01
 Objective function: 1.37E+01
 Objective function: 1.36E+01

 References:
 Bernstein et al, \`On the distance between two neural networks and the
 stability of learning \`\_, 2020
 """
 if not callable(learning\_rate):
 mult = 1 / (1 + learning\_rate\*\*2)\*\*0.5
 return combine.chain(
 transform.scale\_by\_trust\_ratio(min\_norm),
 transform.scale\_by\_learning\_rate(learning\_rate \* mult),
 transform.add\_decayed\_weights((mult - 1)),
 )
 else:
 mult\_lr = lambda count: 1 / (1 + learning\_rate(count)\*\*2)\*\*0.5
 return combine.chain(
 transform.scale\_by\_trust\_ratio(min\_norm),
 transform.scale\_by\_learning\_rate(
 lambda c: mult\_lr(c) \* learning\_rate(c)),
 transform.add\_decayed\_weights(lambda c: mult\_lr(c) - 1),
 )

def lars(
 learning\_rate: base.ScalarOrSchedule,
 weight\_decay: base.ScalarOrSchedule = 0.0,
 weight\_decay\_mask: MaskOrFn = True,
 trust\_coefficient: jax.typing.ArrayLike = 0.001,
 eps: jax.typing.ArrayLike = 0.0,
 trust\_ratio\_mask: MaskOrFn = True,
 momentum: jax.typing.ArrayLike = 0.9,
 nesterov: bool = False,
) -\> base.GradientTransformationExtraArgs:
 """The LARS optimizer.

 LARS is a layer-wise adaptive optimizer introduced to help scale SGD to
 larger batch sizes. LARS later inspired the LAMB optimizer.

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.
 weight\_decay: Strength of the weight decay regularization.
 weight\_decay\_mask: A tree with same structure as (or a prefix of) the params
 PyTree, or a Callable that returns such a pytree given the params/updates.
 The leaves should be booleans, \`True\` for leaves/subtrees you want to
 apply the transformation to, and \`False\` for those you want to skip.
 trust\_coefficient: A multiplier for the trust ratio.
 eps: Optional additive constant in the trust ratio denominator.
 trust\_ratio\_mask: A tree with same structure as (or a prefix of) the params
 PyTree, or a Callable that returns such a pytree given the params/updates.
 The leaves should be booleans, \`True\` for leaves/subtrees you want to
 apply the transformation to, and \`False\` for those you want to skip.
 momentum: Decay rate for momentum.
 nesterov: Whether to use Nesterov momentum.

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> def f(x): return jnp.sum(x \*\* 2) # simple quadratic function
 >>\> solver = optax.lars(learning\_rate=0.003)
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... grad = jax.grad(f)(params)
 ... updates, opt\_state = solver.update(grad, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... print('Objective function: {:.2E}'.format(f(params)))
 Objective function: 1.40E+01
 Objective function: 1.40E+01
 Objective function: 1.40E+01
 Objective function: 1.40E+01
 Objective function: 1.40E+01

 References:
 You et al, \`Large Batch Training of Convolutional Networks
 \`\_, 2017
 """
 return combine.chain(
 transform.add\_decayed\_weights(weight\_decay, mask=weight\_decay\_mask),
 wrappers.masked(
 inner=transform.scale\_by\_trust\_ratio(
 trust\_coefficient=trust\_coefficient, eps=eps
 ),
 mask=trust\_ratio\_mask,
 ),
 transform.scale\_by\_learning\_rate(learning\_rate),
 transform.trace(decay=momentum, nesterov=nesterov),
 )

def lamb(
 learning\_rate: base.ScalarOrSchedule,
 b1: jax.typing.ArrayLike = 0.9,
 b2: jax.typing.ArrayLike = 0.999,
 eps: jax.typing.ArrayLike = 1e-6,
 eps\_root: jax.typing.ArrayLike = 0.0,
 weight\_decay: base.ScalarOrSchedule = 0.0,
 mask: MaskOrFn = None,
) -\> base.GradientTransformationExtraArgs:
 """The LAMB optimizer.

 LAMB is a general purpose layer-wise adaptive large batch optimizer designed
 to provide consistent training performance across a wide range of tasks,
 including those that use attention-based models (such as Transformers) and
 ResNet-50. The optimizer is able to work with small and large batch sizes.
 LAMB was inspired by the LARS learning algorithm.

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.
 b1: Exponential decay rate to track the first moment of past gradients.
 b2: Exponential decay rate to track the second moment of past gradients.
 eps: A small constant applied to denominator outside of the square root (as
 in the Adam paper) to avoid dividing by zero when rescaling.
 eps\_root: A small constant applied to denominator inside the square root (as
 in RMSProp), to avoid dividing by zero when rescaling. This is needed for
 instance when computing (meta-)gradients through Adam.
 weight\_decay: Strength of the weight decay regularization.
 mask: A tree with same structure as (or a prefix of) the params PyTree, or a
 Callable that returns such a pytree given the params/updates. The leaves
 should be booleans, \`True\` for leaves/subtrees you want to apply the
 transformation to, and \`False\` for those you want to skip.

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> def f(x): return jnp.sum(x \*\* 2) # simple quadratic function
 >>\> solver = optax.lamb(learning\_rate=0.003)
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... grad = jax.grad(f)(params)
 ... updates, opt\_state = solver.update(grad, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... print('Objective function: {:.2E}'.format(f(params)))
 Objective function: 1.39E+01
 Objective function: 1.38E+01
 Objective function: 1.38E+01
 Objective function: 1.37E+01
 Objective function: 1.36E+01

 References:
 You et al, \`Large Batch Optimization for Deep Learning: Training BERT in 76
 minutes \`\_, 2020
 """
 return combine.chain(
 transform.scale\_by\_adam(b1=b1, b2=b2, eps=eps, eps\_root=eps\_root),
 transform.add\_decayed\_weights(weight\_decay=weight\_decay, mask=mask),
 transform.scale\_by\_trust\_ratio(),
 transform.scale\_by\_learning\_rate(learning\_rate),
 )

def noisy\_sgd(
 learning\_rate: base.ScalarOrSchedule,
 eta: jax.typing.ArrayLike = 0.01,
 gamma: jax.typing.ArrayLike = 0.55,
 key: jax.typing.ArrayLike \| None = None, # int
 \*,
 seed: int \| None = None, # deprecated
) -\> base.GradientTransformationExtraArgs:
 r"""A variant of SGD with added noise.

 Noisy SGD is a variant of :func:\`optax.sgd\` that incorporates Gaussian noise
 into the updates. It has been found that adding noise to the gradients can
 improve both the training error and the generalization error in very deep
 networks.

 The update :math:\`u\_t\` is modified to include this noise as follows:

 .. math::
 u\_t \\leftarrow -\\alpha\_t (g\_t + N(0, \\sigma\_t^2)),

 where :math:\`N(0, \\sigma\_t^2)\` represents Gaussian noise with zero mean and a
 variance of :math:\`\\sigma\_t^2\`.

 The variance of this noise decays over time according to the formula

 .. math::
 \\sigma\_t^2 = \\frac{\\eta}{(1+t)^\\gamma},

 where :math:\`\\gamma\` is the decay rate parameter \`\`gamma\`\` and :math:\`\\eta\`
 represents the initial variance \`\`eta\`\`.

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.
 eta: Initial variance for the Gaussian noise added to gradients.
 gamma: A parameter controlling the annealing of noise over time \`\`t\`\`, the
 variance decays according to \`\`(1+t)\*\*(-gamma)\`\`.
 key: random generator key for noise generation.
 seed: deprecated, use key instead.

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> def f(x): return jnp.sum(x \*\* 2) # simple quadratic function
 >>\> solver = optax.noisy\_sgd(learning\_rate=0.003, key=0)
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... grad = jax.grad(f)(params)
 ... updates, opt\_state = solver.update(grad, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... print('Objective function: {:.2E}'.format(f(params)))
 Objective function: 1.38E+01
 Objective function: 1.37E+01
 Objective function: 1.35E+01
 Objective function: 1.33E+01
 Objective function: 1.32E+01

 References:
 Neelakantan et al, \`Adding Gradient Noise Improves Learning for Very Deep
 Networks \`\_, 2015
 """
 return combine.chain(
 transform.add\_noise(eta, gamma, key, seed=seed),
 transform.scale\_by\_learning\_rate(learning\_rate),
 )

def sign\_sgd(
 learning\_rate: base.ScalarOrSchedule,
) -\> base.GradientTransformationExtraArgs:
 r"""A variant of SGD using only the signs of the gradient components.

 SignSGD is a variant of SGD that uses the signs of the gradient components in
 the update, not their actual values. The update :math:\`u\_t\` is modified as
 follows:

 .. math::
 u\_t \\leftarrow -\\alpha\_t\\, \\text{sign}\\,(g\_t),

 for :math:\`\\alpha\_t\` a given learning rate at iteration :math:\`t\`, and
 :math:\`\\text{sign}\\,(g\_t)\` the sign of each component of the gradient
 :math:\`g\_t\`.

 SGD variants that use only the signs of the gradient update have historically
 been used since RProp, with modern forms including RMSProp, Adam, and Lion.
 SignSGD uses only the signs of the gradient update. SignSGD enables
 significant gradient compression, substantially reducing the bottleneck
 imposed by communicating gradients when distributing learning across multiple
 workers.

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> def f(x): return jnp.sum(x \*\* 2) # simple quadratic function
 >>\> solver = optax.sign\_sgd(learning\_rate=0.003)
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... grad = jax.grad(f)(params)
 ... updates, opt\_state = solver.update(grad, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... print('Objective function: {:.2E}'.format(f(params)))
 Objective function: 1.40E+01
 Objective function: 1.39E+01
 Objective function: 1.39E+01
 Objective function: 1.39E+01
 Objective function: 1.38E+01

 References:
 Bernstein et al., \`signSGD: Compressed optimization for Non-Convex Problems
 \`\_, 2018

 Balles et al., \`The Geometry of Sign Gradient Descent
 \`\_, 2020
 """
 return combine.chain(
 transform.scale\_by\_sign(),
 transform.scale\_by\_learning\_rate(learning\_rate),
 )

def signum(
 learning\_rate: base.ScalarOrSchedule,
 beta: jax.typing.ArrayLike = 0.9,
 accumulator\_dtype: Any \| None = None,
) -\> base.GradientTransformationExtraArgs:
 r"""A variant of SGD using signs of the components of an EMA of the gradient.

 The update :math:\`u\_t\` is defined from the gradients :math:\`g\_t\` as:

 .. math::
 m\_t \\leftarrow \\beta\\, m\_t + (1 - \\beta)\\, g\_t \\\
 u\_t \\leftarrow -\\alpha\_t\\, \\text{sign}\\,(m\_t),

 where :math:\`\\alpha\_t\` a given learning rate at iteration :math:\`t\`,
 :math:\`m\_t\` is EMA of the gradient.

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.
 beta: Exponential moving average decay rate.
 accumulator\_dtype: Data type for the EMA accumulator.

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 References:
 Bernstein et al., \`signSGD: Compressed optimization for Non-Convex Problems
 \`\_, 2018

 Zhao et al., 'Deconstructing What Makes a Good Optimizer for Language Models
 \`\_, 2024
 """
 return combine.chain(
 # no need to debias the EMA since we're just taking its sign
 transform.ema(beta, debias=False, accumulator\_dtype=accumulator\_dtype),
 transform.scale\_by\_sign(),
 transform.scale\_by\_learning\_rate(learning\_rate),
 )

def novograd(
 learning\_rate: base.ScalarOrSchedule,
 b1: jax.typing.ArrayLike = 0.9,
 b2: jax.typing.ArrayLike = 0.25,
 eps: jax.typing.ArrayLike = 1e-6,
 eps\_root: jax.typing.ArrayLike = 0.0,
 weight\_decay: base.ScalarOrSchedule = 0.0,
) -\> base.GradientTransformationExtraArgs:
 """NovoGrad optimizer.

 NovoGrad is more robust to the initial learning rate and
 weight initialization than other methods. For example,
 NovoGrad works well without LR warm-up, while other methods require it.
 NovoGrad performs exceptionally well for large batch training, e.g. it
 outperforms other methods for ResNet-50 for all batches up to 32K.
 In addition, NovoGrad requires half the memory compared to Adam.
 It was introduced together with Jasper ASR model.

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.
 b1: An exponential decay rate to track the first moment of past gradients.
 b2: An exponential decay rate to track the second moment of past gradients.
 eps: A small constant applied to denominator outside of the square root (as
 in the Adam paper) to avoid dividing by zero when rescaling.
 eps\_root: A small constant applied to denominator inside the square root (as
 in RMSProp), to avoid dividing by zero when rescaling. This is needed for
 instance when computing (meta-)gradients through Adam.
 weight\_decay: Strength of the weight decay regularization.

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> def f(x): return jnp.sum(x \*\* 2) # simple quadratic function
 >>\> solver = optax.novograd(learning\_rate=0.003)
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... grad = jax.grad(f)(params)
 ... updates, opt\_state = solver.update(grad, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... print('Objective function: {:.2E}'.format(f(params)))
 Objective function: 1.40E+01
 Objective function: 1.39E+01
 Objective function: 1.39E+01
 Objective function: 1.38E+01
 Objective function: 1.37E+01

 References:
 Ginsburg et al, \`Stochastic Gradient Methods with Layer-wise Adaptive
 Moments for Training of Deep Networks \`\_,
 2019

 Li et al, \`Jasper: An End-to-End Convolutional Neural Acoustic Model
 \`\_, 2019
 """
 return combine.chain(
 transform.scale\_by\_novograd(
 b1=b1, b2=b2, eps=eps, eps\_root=eps\_root, weight\_decay=weight\_decay
 ),
 transform.scale\_by\_learning\_rate(learning\_rate),
 )

def optimistic\_gradient\_descent(
 learning\_rate: base.ScalarOrSchedule,
 alpha: base.ScalarOrSchedule = 1.0,
 beta: base.ScalarOrSchedule = 1.0,
) -\> base.GradientTransformationExtraArgs:
 r"""An Optimistic Gradient Descent optimizer.

 Optimistic gradient descent is an approximation of extra-gradient methods
 which require multiple gradient calls to compute the next update. It has
 strong formal guarantees for last-iterate convergence in min-max games, for
 which standard gradient descent can oscillate or even diverge.

 At step :math:\`t\`, the parameters :math:\`w\_t\` are updated according to the
 current gradient :math:\`g\_t\` as well as the previous gradient :math:\`g\_{t-1}\`,
 scaled by the learning rate :math:\`\\eta\_t\`:

 .. math::

 \\begin{align\*}
 u\_t &= (\\alpha\_t + \\beta\_t) g\_t - \\beta\_t g\_{t-1} \\\
 w\_{t+1} &= w\_t - \\eta\_t u\_t
 \\end{align\*}

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.
 alpha: Coefficient for generalized OGD.
 beta: Coefficient for generalized OGD negative momentum.

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> def f(x): return jnp.sum(x \*\* 2) # simple quadratic function
 >>\> solver = optax.optimistic\_gradient\_descent(learning\_rate=0.003)
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... grad = jax.grad(f)(params)
 ... updates, opt\_state = solver.update(grad, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... print('Objective function: {:.2E}'.format(f(params)))
 Objective function: 1.38E+01
 Objective function: 1.37E+01
 Objective function: 1.35E+01
 Objective function: 1.33E+01
 Objective function: 1.32E+01

 References:
 Mokhtari et al, \`A Unified Analysis of Extra-gradient and
 Optimistic Gradient Methods for Saddle Point Problems: Proximal
 Point Approach \`\_, 2019

 .. seealso::
 :doc:\`../\_collections/examples/ogda\_example\`
 """
 return combine.chain(
 transform.scale\_by\_optimistic\_gradient(alpha=alpha, beta=beta),
 transform.scale\_by\_learning\_rate(learning\_rate),
 )

def optimistic\_adam(
 learning\_rate: jax.typing.ArrayLike,
 optimism: Optional\[jax.typing.ArrayLike\] = None,
 b1: jax.typing.ArrayLike = 0.9,
 b2: jax.typing.ArrayLike = 0.999,
 eps: jax.typing.ArrayLike = 1e-08,
 eps\_root: jax.typing.ArrayLike = 0.0,
 mu\_dtype: Optional\[Any\] = None,
 \*,
 nesterov: bool = True,
) -\> base.GradientTransformationExtraArgs:
 r"""The Optimistic Adam optimizer.

 This is an optimistic version of the Adam optimizer. It addresses the issue
 of limit cycling behavior in training Generative Adversarial Networks and
 other saddle-point min-max problems.

 The algorithm is as follows. First, we define the following parameters:

 \- :math:\`\\alpha\`: the learning rate.
 \- :math:\`o\` the optimism rate.
 \- :math:\`\\beta\_1\` the exponential decay rate for the first moment estimate.
 \- :math:\`\\beta\_2\` the exponential decay rate for the second moment estimate.

 Second, we define the following variables:

 \- :math:\`g\_t\`: the incoming gradient.
 \- :math:\`m\_t\`: the biased first moment estimate.
 \- :math:\`v\_t\`: the biased second raw moment estimate.
 \- :math:\`\\hat{m}\_t\`: the bias-corrected first moment estimate.
 \- :math:\`\\hat{v}\_t\`: the bias-corrected second raw moment estimate.
 \- :math:\`r\_t\`: the signal-to-noise ratio (SNR) vector.
 \- :math:\`u\_t\`: the outgoing update vector.
 \- :math:\`S\_t\`: the state of the optimizer.

 Finally, on each iteration, the variables are updated as follows:

 .. math::

 \\begin{align\*}
 m\_t &\\leftarrow \\beta\_1 \\cdot m\_{t - 1} + (1 - \\beta\_1) \\cdot g\_t \\\
 v\_t &\\leftarrow \\beta\_2 \\cdot v\_{t - 1} + (1 - \\beta\_2) \\cdot g\_t^2 \\\
 \\hat{m}\_t &\\leftarrow m\_t / {(1 - \\beta\_1^t)} \\\
 \\hat{v}\_t &\\leftarrow v\_t / {(1 - \\beta\_2^t)} \\\
 r\_t &\\leftarrow \\hat{m}\_t / \\left({\\sqrt{\\hat{v}\_t +
 \\bar{\\varepsilon}} + \\varepsilon} \\right) \\\
 u\_t &\\leftarrow -\\alpha r\_t - o (r\_t - r\_{t - 1}) \\\
 S\_t &\\leftarrow (m\_t, v\_t, r\_t).
 \\end{align\*}

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.
 optimism: The amount of optimism to be applied. If None, defaults to
 learning\_rate, as in the paper.
 b1: Exponential decay rate to track the first moment of past gradients.
 b2: Exponential decay rate to track the second moment of past gradients.
 eps: Term added to the denominator to improve numerical stability.
 eps\_root: Term added to the second moment of the prediction error to
 improve numerical stability. If backpropagating gradients through the
 gradient transformation (e.g. for meta-learning), this must be non-zero.
 mu\_dtype: Optional \`dtype\` to be used for the first order accumulator; if
 \`None\` then the \`dtype\` is inferred from \`params\` and \`updates\`.
 nesterov: Whether to use Nesterov momentum.

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> from jax import numpy as jnp, lax
 >>\> def f(x, y):
 ... return x \* y # simple bilinear function
 >>\> opt = optax.optimistic\_adam(1e-2, 1.0)
 >>\> def step(state, \_):
 ... params, opt\_state = state
 ... distance = jnp.hypot(\*params)
 ... grads = jax.grad(f, argnums=(0, 1))(\*params)
 ... grads = grads\[0\], -grads\[1\]
 ... updates, opt\_state = opt.update(grads, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... return (params, opt\_state), distance
 >>\> params = 1.0, 2.0
 >>\> opt\_state = opt.init(params)
 >>\> \_, distances = lax.scan(step, (params, opt\_state), length=1025)
 >>\> for i in range(6):
 ... print(f"{distances\[4\*\*i\]:.3f}")
 2.243
 2.195
 2.161
 2.055
 0.796
 0.001

 References:
 Daskalakis et al, \`Training GANs with Optimism
 \`\_, 2017

 .. seealso::
 :doc:\`../\_collections/examples/ogda\_example\`
 """
 warnings.warn('\`optimistic\_adam\` is deprecated, please use'
 ' \`optimistic\_adam\_v2\` instead.', category=DeprecationWarning)
 if callable(learning\_rate):
 raise ValueError('This version of \`optimistic\_adam\` does not support'
 ' learning rate schedules but \`optimistic\_adam\_v2\` does.')
 if optimism is None:
 optimism = learning\_rate
 return combine.chain(
 transform.scale\_by\_adam(
 b1=b1,
 b2=b2,
 eps=eps,
 eps\_root=eps\_root,
 mu\_dtype=mu\_dtype,
 nesterov=nesterov,
 ),
 transform.scale\_by\_optimistic\_gradient(alpha=learning\_rate,
 beta=optimism),
 transform.scale\_by\_learning\_rate(1.0), # flips the sign
 )

def optimistic\_adam\_v2(
 learning\_rate: base.ScalarOrSchedule,
 \*,
 alpha: jax.typing.ArrayLike = 1.0,
 beta: jax.typing.ArrayLike = 1.0,
 b1: jax.typing.ArrayLike = 0.9,
 b2: jax.typing.ArrayLike = 0.999,
 eps: jax.typing.ArrayLike = 1e-08,
 eps\_root: jax.typing.ArrayLike = 0.0,
 mu\_dtype: Optional\[Any\] = None,
 nesterov: bool = True,
) -\> base.GradientTransformationExtraArgs:
 r"""The Optimistic Adam optimizer.

 This is an optimistic version of the Adam optimizer. It addresses the issue
 of limit cycling behavior in training Generative Adversarial Networks and
 other saddle-point min-max problems.

 The "\_v2" suffix refers to the re-worked version of the interface (not the
 algorithm) and will eventually replace the interface of the current
 :func:\`optimistic\_adam\` function.

 The algorithm is as follows. First, we define the following parameters:

 \- :math:\`learning\_rate\`: the learning rate.
 \- :math:\`\\alpha\`: the alpha rate in optimistic gradient descent.
 \- :math:\`\\beta\`: the beta rate in optimistic gradient descent.
 \- :math:\`\\beta\_1\` the exponential decay rate for the first moment estimate.
 \- :math:\`\\beta\_2\` the exponential decay rate for the second moment estimate.

 Second, we define the following variables:

 \- :math:\`g\_t\`: the incoming gradient.
 \- :math:\`m\_t\`: the biased first moment estimate.
 \- :math:\`v\_t\`: the biased second raw moment estimate.
 \- :math:\`\\hat{m}\_t\`: the bias-corrected first moment estimate.
 \- :math:\`\\hat{v}\_t\`: the bias-corrected second raw moment estimate.
 \- :math:\`r\_t\`: the signal-to-noise ratio (SNR) vector.
 \- :math:\`u\_t\`: the outgoing update vector.
 \- :math:\`S\_t\`: the state of the optimizer.

 Finally, on each iteration, the variables are updated as follows:

 .. math::

 \\begin{align\*}
 m\_t &\\leftarrow \\beta\_1 \\cdot m\_{t - 1} + (1 - \\beta\_1) \\cdot g\_t \\\
 v\_t &\\leftarrow \\beta\_2 \\cdot v\_{t - 1} + (1 - \\beta\_2) \\cdot g\_t^2 \\\
 \\hat{m}\_t &\\leftarrow m\_t / {(1 - \\beta\_1^t)} \\\
 \\hat{v}\_t &\\leftarrow v\_t / {(1 - \\beta\_2^t)} \\\
 r\_t &\\leftarrow \\hat{m}\_t / \\left({\\sqrt{\\hat{v}\_t +
 \\bar{\\varepsilon}} + \\varepsilon} \\right) \\\
 u\_t &\\leftarrow -\\alpha\_t r\_t - o\_t (r\_t - r\_{t - 1}) \\\
 S\_t &\\leftarrow (m\_t, v\_t, r\_t).
 \\end{align\*}

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.
 alpha: One of two scalar optimism parameters in optimistic gradient descent.
 beta: One of two scalar optimism parameters in optimistic gradient descent.
 b1: Exponential decay rate to track the first moment of past gradients.
 b2: Exponential decay rate to track the second moment of past gradients.
 eps: Term added to the denominator to improve numerical stability.
 eps\_root: Term added to the second moment of the prediction error to
 improve numerical stability. If backpropagating gradients through the
 gradient transformation (e.g. for meta-learning), this must be non-zero.
 mu\_dtype: Optional \`dtype\` to be used for the first order accumulator; if
 \`None\` then the \`dtype\` is inferred from \`params\` and \`updates\`.
 nesterov: Whether to use Nesterov momentum.

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> from jax import numpy as jnp, lax
 >>\> def f(x, y):
 ... return x \* y # simple bilinear function
 >>\> opt = optax.optimistic\_adam\_v2(1.0, alpha=1e-2, beta=1.0)
 >>\> def step(state, \_):
 ... params, opt\_state = state
 ... distance = jnp.hypot(\*params)
 ... grads = jax.grad(f, argnums=(0, 1))(\*params)
 ... grads = grads\[0\], -grads\[1\]
 ... updates, opt\_state = opt.update(grads, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... return (params, opt\_state), distance
 >>\> params = 1.0, 2.0
 >>\> opt\_state = opt.init(params)
 >>\> \_, distances = lax.scan(step, (params, opt\_state), length=1025)
 >>\> for i in range(6):
 ... print(f"{distances\[4\*\*i\]:.3f}")
 2.243
 2.195
 2.161
 2.055
 0.796
 0.001

 References:
 Daskalakis et al, \`Training GANs with Optimism
 \`\_, 2017

 .. seealso::
 :doc:\`../\_collections/examples/ogda\_example\`
 """
 return combine.chain(
 transform.scale\_by\_adam(
 b1=b1,
 b2=b2,
 eps=eps,
 eps\_root=eps\_root,
 mu\_dtype=mu\_dtype,
 nesterov=nesterov,
 ),
 transform.scale\_by\_optimistic\_gradient(alpha=alpha, beta=beta),
 transform.scale\_by\_learning\_rate(learning\_rate),
 )

def radam(
 learning\_rate: base.ScalarOrSchedule,
 b1: jax.typing.ArrayLike = 0.9,
 b2: jax.typing.ArrayLike = 0.999,
 eps: jax.typing.ArrayLike = 1e-8,
 eps\_root: jax.typing.ArrayLike = 0.0,
 threshold: jax.typing.ArrayLike = 5.0,
 \*,
 nesterov: bool = False,
) -\> base.GradientTransformationExtraArgs:
 """The Rectified Adam optimizer.

 The adaptive learning rate in Adam has undesirably large variance in early
 stages of training, due to the limited number of training samples used to
 estimate the optimizer's statistics. Rectified Adam addresses this issue
 by analytically reducing the large variance.

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.
 b1: Exponential decay rate to track the first moment of past gradients.
 b2: Exponential decay rate to track the second moment of past gradients.
 eps: A small constant applied to denominator outside of the square root (as
 in the Adam paper) to avoid dividing by zero when rescaling.
 eps\_root: A small constant applied to denominator inside the square root (as
 in RMSProp), to avoid dividing by zero when rescaling. This is needed for
 instance when computing (meta-)gradients through Adam.
 threshold: Threshold for variance tractability.
 nesterov: Whether to use Nesterov momentum.

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> def f(x): return jnp.sum(x \*\* 2) # simple quadratic function
 >>\> solver = optax.radam(learning\_rate=0.003)
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... grad = jax.grad(f)(params)
 ... updates, opt\_state = solver.update(grad, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... print('Objective function: {:.2E}'.format(f(params)))
 Objective function: 1.38E+01
 Objective function: 1.37E+01
 Objective function: 1.35E+01
 Objective function: 1.33E+01
 Objective function: 1.32E+01

 References:
 Liu et al, 2020: \`On the Variance of the Adaptive Learning Rate and Beyond
 \`\_, 2020
 """
 return combine.chain(
 transform.scale\_by\_radam(
 b1=b1,
 b2=b2,
 eps=eps,
 eps\_root=eps\_root,
 threshold=threshold,
 nesterov=nesterov,
 ),
 transform.scale\_by\_learning\_rate(learning\_rate),
 )

def rmsprop(
 learning\_rate: base.ScalarOrSchedule,
 decay: jax.typing.ArrayLike = 0.9,
 eps: jax.typing.ArrayLike = 1e-8,
 initial\_scale: jax.typing.ArrayLike = 0.0,
 eps\_in\_sqrt: bool = True,
 centered: bool = False,
 momentum: Optional\[jax.typing.ArrayLike\] = None,
 nesterov: bool = False,
 bias\_correction: bool = False,
) -\> base.GradientTransformationExtraArgs:
 r"""A flexible RMSProp optimizer.

 RMSProp is an SGD variant with learning rate adaptation. The \`learning\_rate\`
 used for each weight is scaled by a suitable estimate of the magnitude of the
 gradients on previous steps. Several variants of RMSProp can be found
 in the literature. This alias provides an easy to configure RMSProp
 optimizer that can be used to switch between several of these variants.

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.
 decay: Decay used to track the magnitude of previous gradients.
 eps: A small numerical constant to avoid dividing by zero when rescaling.
 initial\_scale: Initial value of accumulators tracking the magnitude of
 previous updates. PyTorch uses \`0\`, TF1 uses \`1\`. When reproducing results
 from a paper, verify the value used by the authors.
 eps\_in\_sqrt: Whether to add \`\`eps\`\` in the square root of the denominator or
 outside the square root.
 centered: Whether the second moment or the variance of the past gradients is
 used to rescale the latest gradients.
 momentum: Decay rate used by the momentum term, when it is set to \`None\`,
 then momentum is not used at all.
 nesterov: Whether Nesterov momentum is used.
 bias\_correction: Whether to apply bias correction to the estimates of the
 second moments (and first moment if \`\`centered=True\`\`).

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> def f(x): return jnp.sum(x \*\* 2) # simple quadratic function
 >>\> solver = optax.rmsprop(learning\_rate=0.003)
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... grad = jax.grad(f)(params)
 ... updates, opt\_state = solver.update(grad, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... print('Objective function: {:.2E}'.format(f(params)))
 Objective function: 1.39E+01
 Objective function: 1.38E+01
 Objective function: 1.37E+01
 Objective function: 1.37E+01
 Objective function: 1.36E+01

 References:
 Hinton, \`Overview of mini-batch gradient descent\`
 \`\_, 2012

 Graves, \`Generating Sequences With Recurrent Neural Networks
 \`\_, 2014

 Ziyin, \`LaProp: Separating Momentum and Adaptivity in Adam
 \`\_, 2021

 .. warning::
 Default behavior of optax's RMSprop (\`\`eps\_in\_sqrt=True\`\`) differs from
 Pytorch's implementation and could impact performance.
 If \`\`eps\_in\_sqrt=True\`\`, in the denominator, optax uses
 :math:\`\\sqrt{v + \\epsilon}\` in the denominator whereas PyTorch uses
 :math:\`\\sqrt{v} + \\epsilon\`.
 Using \`\`eps\_in\_sqrt=False\`\` in optax will match PyTorch's behavior.
 See
 https://github.com/google-deepmind/optax/issues/532 for more detail.
 """
 if centered:
 return combine.chain(
 transform.scale\_by\_stddev(
 decay=decay,
 eps=eps,
 initial\_scale=initial\_scale,
 eps\_in\_sqrt=eps\_in\_sqrt,
 bias\_correction=bias\_correction,
 ),
 transform.scale\_by\_learning\_rate(learning\_rate),
 (
 transform.trace(decay=momentum, nesterov=nesterov)
 if momentum is not None
 else base.identity()
 ),
 )
 return combine.chain(
 transform.scale\_by\_rms(
 decay=decay,
 eps=eps,
 initial\_scale=initial\_scale,
 eps\_in\_sqrt=eps\_in\_sqrt,
 bias\_correction=bias\_correction,
 ),
 transform.scale\_by\_learning\_rate(learning\_rate),
 (
 transform.trace(decay=momentum, nesterov=nesterov)
 if momentum is not None
 else base.identity()
 ),
 )

def sgd(
 learning\_rate: base.ScalarOrSchedule,
 momentum: Optional\[jax.typing.ArrayLike\] = None,
 nesterov: bool = False,
 accumulator\_dtype: Optional\[Any\] = None,
) -\> base.GradientTransformationExtraArgs:
 r"""A canonical Stochastic Gradient Descent optimizer.

 This implements stochastic gradient descent. It also includes support for
 momentum, and Nesterov acceleration, as these are standard practice when
 using stochastic gradient descent to train deep neural networks.

 The canonical stochastic gradient descent returns an update
 :math:\`u\_t\` of the form

 .. math::
 u\_t \\leftarrow -\\alpha\_t g\_t,

 where :math:\`g\_t\` is the gradient of the objective (potentially preprocessed
 by other transformations) and :math:\`\\alpha\_t\` is the \`\`learning\_rate\`\` at
 time :math:\`t\` (constant or selected by an :class:\`optax.Schedule\`).

 Stochastic gradient descent with momentum takes two possible forms.

 .. math::

 \\begin{align\*}
 m\_t &\\leftarrow g\_t + \\mu m\_{t-1} \\\
 u\_t &\\leftarrow \\begin{cases}
 -\\alpha\_t m\_t & \\text{ if } \\texttt{nesterov = False} \\\
 -\\alpha\_t (g\_t + \\mu m\_t) & \\text{ if } \\texttt{nesterov = True}
 \\end{cases} \\\
 S\_t &\\leftarrow m\_t,
 \\end{align\*}

 where :math:\`\\mu\` is the \`\`momentum\`\` parameter and :math:\`S\_t\` is the state
 of the optimizer.

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.
 momentum: Decay rate used by the momentum term, when it is set to \`\`None\`\`,
 then momentum is not used at all.
 nesterov: Whether Nesterov momentum is used.
 accumulator\_dtype: Optional \`\`dtype\`\` to be used for the accumulator; if
 \`\`None\`\` then the \`\`dtype\`\` is inferred from \`\`params\`\` and \`\`updates\`\`.

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> def f(x): return jnp.sum(x \*\* 2) # simple quadratic function
 >>\> solver = optax.sgd(learning\_rate=0.003)
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... grad = jax.grad(f)(params)
 ... updates, opt\_state = solver.update(grad, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... print('Objective function: {:.2E}'.format(f(params)))
 Objective function: 1.38E+01
 Objective function: 1.37E+01
 Objective function: 1.35E+01
 Objective function: 1.33E+01
 Objective function: 1.32E+01

 References:
 Sutskever et al, \`On the importance of initialization and momentum in deep
 learning \`\_, 2013
 """
 if momentum is not None:
 opt = transform.trace(
 decay=momentum,
 nesterov=nesterov,
 accumulator\_dtype=accumulator\_dtype,
 )
 else:
 opt = base.identity()
 return combine.chain(
 opt,
 transform.scale\_by\_learning\_rate(learning\_rate),
 )

def sm3(
 learning\_rate: jax.typing.ArrayLike, momentum: jax.typing.ArrayLike = 0.9
) -\> base.GradientTransformationExtraArgs:
 r"""The SM3 optimizer.

 SM3 (Square-root of Minima of Sums of Maxima of Squared-gradients Method) is a
 memory-efficient adaptive optimizer designed to decrease memory overhead when
 training very large models, such as the Transformer for machine translation,
 BERT for language modeling, and AmoebaNet-D for image classification. SM3: 1)
 applies to tensors of arbitrary dimensions and any predefined cover of the
 parameters; 2) adapts the learning rates in an adaptive and data-driven manner
 (like Adagrad and unlike Adafactor); and 3) comes with rigorous convergence
 guarantees in stochastic convex optimization settings.

 The init function of this optimizer initializes an internal state
 :math:\`S\_0 := \\{\\mu\_0, w\_1\\} = \\{0, 0\\}\`, representing initial estimates for
 the cumulative squared gradients and the weights. These values are stored as
 pytrees containing all zeros, with the same shape as the model updates. At
 step :math:\`t\`, the update function of this optimizer takes as arguments
 the incoming gradients :math:\`g\_t\` and optimizer state :math:\`S\_t\` and
 computes updates :math:\`u\_t\` and new state :math:\`S\_{t+1}\`. Thus, for
 :math:\`t > 0\`, we have:

 SM3-I Algorithm

 .. math::

 \\begin{array}{l}
 \\text{parameters: learning rate } \\eta \\\
 \\text{initialize } w\_1 = 0; \\forall r \\in \[k\]: \\mu\_0(r) = 0 \\\
 \\text{for } t = 1, \\ldots, T \\text{ do} \\\
 \\quad \\text{receive gradient } g\_t = \\nabla \\ell\_t(w\_t) \\\
 \\quad \\text{for } r = 1, \\ldots, k \\text{ do} \\\
 \\quad \\quad \\mu\_t(r) \\leftarrow \\mu\_{t-1}(r) +
 \\max\_{j \\in S\_r} g\_t^2(j) \\\
 \\quad \\text{for } i = 1, \\ldots, d \\text{ do} \\\
 \\quad \\quad \\nu\_t(i) \\leftarrow \\min\_{r:S\_r \\ni i} \\mu\_t(r) \\\
 \\quad \\quad w\_{t+1}(i) \\leftarrow w\_t(i) -
 \\eta \\frac{g\_t(i)}{\\sqrt{\\nu\_t(i)}} \\\
 \\quad \\quad \\text{with the convention that } 0/0 = 0
 \\end{array}

 SM3-II Algorithm

 The SM3-II optimizer initializes with parameters like the learning rate
 :math:\\eta and weight :math:w\_1. It updates weights iteratively using
 gradients :math:g\_t, adjusting each component with minimum accumulated
 values :math:\\nu'\_t(i) and maintaining cumulative maximums :math:\\mu'\_t(r)
 for subsets :math:S\_r. SM3-II starts with an initial state
 :math:S\_0 := (m\_0, s\_0) set to zero, storing estimates for first and second
 moments as pytrees matching model updates' shape

 .. math::

 \\begin{array}{l}
 \\text{parameters: learning rate } \\eta \\\
 \\text{initialize } w\_1 = 0; \\forall r \\in \[k\]: \\mu'\_0(r) = 0 \\\
 \\text{for } t = 1, \\ldots, T \\text{ do} \\\
 \\quad \\text{receive gradient } g\_t = \\nabla \\ell\_t(w\_t) \\\
 \\quad \\text{initialize } \\mu'\_t(r) = 0 \\text{ for all } r \\in \[k\] \\\
 \\quad \\text{for } i = 1, \\ldots, d \\text{ do} \\\
 \\quad \\quad \\nu'\_t(i) \\leftarrow \\min\_{r:S\_r \\ni i}
 \\mu'\_{t-1}(r) + g\_t^2(i) \\\
 \\quad \\quad w\_{t+1}(i) \\leftarrow w\_t(i) -
 \\eta \\frac{g\_t(i)}{\\sqrt{\\nu'\_t(i)}} \\\
 \\quad \\quad \\text{with the convention that } 0/0 = 0 \\\
 \\quad \\text{for all } r : S\_r \\ni i \\text{ do} \\\
 \\quad \\quad \\mu'\_t(r) \\leftarrow \\max\\{\\mu'\_t(r), \\nu'\_t(i)\\}
 \\end{array}

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.
 momentum: Decay rate used by the momentum term (when it is not set to
 \`None\`, then momentum is not used at all).

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> def f(x): return jnp.sum(x \*\* 2) # simple quadratic function
 >>\> solver = optax.sm3(learning\_rate=0.003)
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... grad = jax.grad(f)(params)
 ... updates, opt\_state = solver.update(grad, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... print('Objective function: {:.2E}'.format(f(params)))
 Objective function: 1.40E+01
 Objective function: 1.40E+01
 Objective function: 1.40E+01
 Objective function: 1.40E+01
 Objective function: 1.40E+01

 References:
 Anil et al, \`Memory-Efficient Adaptive Optimization
 \`\_, 2019
 """
 return combine.chain(
 transform.scale\_by\_sm3(momentum),
 transform.scale(-learning\_rate),
 )

def yogi(
 learning\_rate: base.ScalarOrSchedule,
 b1: jax.typing.ArrayLike = 0.9,
 b2: jax.typing.ArrayLike = 0.999,
 eps: jax.typing.ArrayLike = 1e-3,
) -\> base.GradientTransformationExtraArgs:
 # pylint: disable=line-too-long
 """The Yogi optimizer.

 Yogi is an adaptive optimizer, which provides control in tuning the effective
 learning rate to prevent it from increasing. By doing so, it focuses on
 addressing the issues of convergence and generalization in exponential moving
 average-based adaptive methods (such as Adam and RMSprop). Yogi is a
 modification of Adam and uses the same parameters.

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.
 b1: Exponential decay rate to track the first moment of past gradients.
 b2: Exponential decay rate to track the second moment of past gradients.
 eps: A small constant applied to denominator outside of the square root (as
 in the Adam paper) to avoid dividing by zero when rescaling.

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> def f(x): return jnp.sum(x \*\* 2) # simple quadratic function
 >>\> solver = optax.yogi(learning\_rate=0.002)
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... grad = jax.grad(f)(params)
 ... updates, opt\_state = solver.update(grad, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... print('Objective function: {:.2E}'.format(f(params)))
 Objective function: 1.40E+01
 Objective function: 1.40E+01
 Objective function: 1.39E+01
 Objective function: 1.39E+01
 Objective function: 1.39E+01

 References:
 Zaheer et al, \`Adaptive Methods for Nonconvex Optimization
 \`\_,
 2018
 """
 # pylint: enable=line-too-long
 return combine.chain(
 transform.scale\_by\_yogi(b1=b1, b2=b2, eps=eps),
 transform.scale\_by\_learning\_rate(learning\_rate),
 )

def adamax(
 learning\_rate: base.ScalarOrSchedule,
 b1: jax.typing.ArrayLike = 0.9,
 b2: jax.typing.ArrayLike = 0.999,
 eps: jax.typing.ArrayLike = 1e-8,
) -\> base.GradientTransformationExtraArgs:
 r"""A variant of the Adam optimizer that uses the infinity norm.

 AdaMax is a variant of the :func:\`optax.adam\` optimizer. By generalizing
 Adam's :math:\`L^2\` norm to an :math:\`L^p\` norm and taking the limit as
 :math:\`p \\rightarrow \\infty\`, we obtain a simple and stable update rule.

 Let :math:\`\\alpha\_t\` represent the learning rate and :math:\`\\beta\_1, \\beta\_2\`,
 :math:\`\\varepsilon\` represent the arguments
 \`\`b1\`\`, \`\`b2\`\` and \`\`eps\`\` respectively. The learning rate is
 indexed by :math:\`t\` since the learning rate may also be provided by a
 schedule function.

 The \`\`init\`\` function of this optimizer initializes an internal state
 :math:\`S\_0 := (m\_0, v\_0) = (0, 0)\`, representing initial estimates for the
 first and second moments. In practice these values are stored as pytrees
 containing all zeros, with the same shape as the model updates.
 At step :math:\`t\`, the \`\`update\`\` function of this optimizer takes as
 arguments the incoming gradients :math:\`g\_t\` and optimizer state :math:\`S\_t\`
 and computes updates :math:\`u\_t\` and new state :math:\`S\_{t+1}\`. Thus, for
 :math:\`t > 0\`, we have,

 .. math::

 \\begin{align\*}
 m\_t &\\leftarrow \\beta\_1 \\cdot m\_{t-1} + (1-\\beta\_1) \\cdot g\_t \\\
 v\_t &\\leftarrow \\max(\\left\| g\_t \\right\| + \\varepsilon, \\beta\_2 \\cdot
 v\_{t-1}) \\\
 \\hat{m}\_t &\\leftarrow m\_t / (1-\\beta\_1^t) \\\
 u\_t &\\leftarrow -\\alpha\_t \\cdot \\hat{m}\_t / v\_t \\\
 S\_t &\\leftarrow (m\_t, v\_t).
 \\end{align\*}

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.
 b1: Exponential decay rate to track the first moment of past gradients.
 b2: Exponential decay rate to track the maximum of past gradients.
 eps: A small constant applied to denominator to avoid dividing by zero when
 rescaling.

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> def f(x): return jnp.sum(x \*\* 2) # simple quadratic function
 >>\> solver = optax.adamax(learning\_rate=0.003)
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... grad = jax.grad(f)(params)
 ... updates, opt\_state = solver.update(grad, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... print('Objective function: {:.2E}'.format(f(params)))
 Objective function: 1.40E+01
 Objective function: 1.39E+01
 Objective function: 1.39E+01
 Objective function: 1.39E+01
 Objective function: 1.38E+01

 References:
 Kingma et al, 2014: https://arxiv.org/abs/1412.6980

 .. seealso:: :func:\`optax.adam\`, :func:\`optax.adamaxw\`.
 """
 return combine.chain(
 transform.scale\_by\_adamax(
 b1=b1,
 b2=b2,
 eps=eps,
 ),
 transform.scale\_by\_learning\_rate(learning\_rate),
 )

def adamaxw(
 learning\_rate: base.ScalarOrSchedule,
 b1: jax.typing.ArrayLike = 0.9,
 b2: jax.typing.ArrayLike = 0.999,
 eps: jax.typing.ArrayLike = 1e-8,
 weight\_decay: base.ScalarOrSchedule = 1e-4,
 mask: Optional\[Union\[Any, Callable\[\[base.Params\], Any\]\]\] = None,
) -\> base.GradientTransformationExtraArgs:
 """Adamax with weight decay regularization.

 AdamaxW uses weight decay to regularize learning towards small weights, as
 this leads to better generalization. In SGD you can also use L2 regularization
 to implement this as an additive loss term, however L2 regularization
 does not behave as intended for adaptive gradient algorithms such as Adam.

 Args:
 learning\_rate: A global scaling factor, either fixed or evolving along
 iterations with a scheduler, see :func:\`optax.scale\_by\_learning\_rate\`.
 b1: Exponential decay rate to track the first moment of past gradients.
 b2: Exponential decay rate to track the maximum of past gradients.
 eps: A small constant applied to denominator to avoid dividing by zero when
 rescaling.
 weight\_decay: Strength of the weight decay regularization. Note that this
 weight decay is multiplied with the learning rate. This is consistent with
 other frameworks such as PyTorch, but different from (Loshchilov et al,
 2019) where the weight decay is only multiplied with the "schedule
 multiplier", but not the base learning rate.
 mask: A tree with same structure as (or a prefix of) the params PyTree, or a
 Callable that returns such a pytree given the params/updates. The leaves
 should be booleans, \`True\` for leaves/subtrees you want to apply the
 weight decay to, and \`False\` for those you want to skip. Note that the
 Adamax gradient transformations are applied to all parameters.

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> def f(x): return jnp.sum(x \*\* 2) # simple quadratic function
 >>\> solver = optax.adamaxw(learning\_rate=0.003)
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... grad = jax.grad(f)(params)
 ... updates, opt\_state = solver.update(grad, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... print('Objective function: {:.2E}'.format(f(params)))
 Objective function: 1.40E+01
 Objective function: 1.39E+01
 Objective function: 1.39E+01
 Objective function: 1.39E+01
 Objective function: 1.38E+01

 References:
 Loshchilov et al, 2019: https://arxiv.org/abs/1711.05101

 .. warning::
 Sometimes you may want to skip weight decay for BatchNorm scale
 or for the bias parameters. You can use \`optax.masked\` to make your own
 AdamaxW variant where \`additive\_weight\_decay\` is applied only to a subset of
 \`params\`.

 .. seealso:: :func:\`optax.adam\`, :func:\`optax.adamax\`.
 """
 return combine.chain(
 transform.scale\_by\_adamax(b1=b1, b2=b2, eps=eps),
 transform.add\_decayed\_weights(weight\_decay, mask),
 transform.scale\_by\_learning\_rate(learning\_rate),
 )

def rprop(
 learning\_rate: jax.typing.ArrayLike,
 eta\_minus: jax.typing.ArrayLike = 0.5,
 eta\_plus: jax.typing.ArrayLike = 1.2,
 min\_step\_size: jax.typing.ArrayLike = 1e-6,
 max\_step\_size: jax.typing.ArrayLike = 50.0,
) -\> base.GradientTransformationExtraArgs:
 """The Rprop optimizer.

 Rprop, short for resillient backpropogation, is a first order variant of
 gradient descent. It responds only to the sign of the gradient by increasing
 or decreasing the step size selected per parameter exponentially to speed up
 convergence and avoid oscillations.

 Args:
 learning\_rate: The initial step size.
 eta\_minus: Multiplicative factor for decreasing step size. This is applied
 when the gradient changes sign from one step to the next.
 eta\_plus: Multiplicative factor for increasing step size. This is applied
 when the gradient has the same sign from one step to the next.
 min\_step\_size: Minimum allowed step size. Smaller steps will be clipped to
 this value.
 max\_step\_size: Maximum allowed step size. Larger steps will be clipped to
 this value.

 Returns:
 The corresponding :class:\`optax.GradientTransformationExtraArgs\`.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> def f(x): return jnp.sum(x \*\* 2) # simple quadratic function
 >>\> solver = optax.rprop(learning\_rate=0.003)
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... grad = jax.grad(f)(params)
 ... updates, opt\_state = solver.update(grad, opt\_state, params)
 ... params = optax.apply\_updates(params, updates)
 ... print('Objective function: {:.2E}'.format(f(params)))
 Objective function: 1.40E+01
 Objective function: 1.40E+01
 Objective function: 1.39E+01
 Objective function: 1.39E+01
 Objective function: 1.38E+01

 References:
 Riedmiller et al. \`A direct adaptive method for faster backpropagation
 learning: the RPROP algorithm
 \`\_, 1993

 Igel et al. \`Empirical evaluation of the improved Rprop learning
 algorithms
 \`\_,
 2003
 """
 return combine.chain(
 transform.scale\_by\_rprop(
 learning\_rate=learning\_rate,
 eta\_minus=eta\_minus,
 eta\_plus=eta\_plus,
 min\_step\_size=min\_step\_size,
 max\_step\_size=max\_step\_size,
 ),
 transform.scale(-1.0),
 )

def polyak\_sgd(
 max\_learning\_rate: jax.typing.ArrayLike = 1.0,
 scaling: base.ScalarOrSchedule = 1.0,
 f\_min: jax.typing.ArrayLike = 0.0,
 eps: jax.typing.ArrayLike = 0.0,
 variant: str = 'sps',
) -\> base.GradientTransformationExtraArgs:
 r"""SGD with Polyak step-size.

 This solver implements the SGD with Polyak step size of (Loizou et al. 2021).
 It sets the step-size as

 .. math::
 s \\min\\left\\{\\frac{f(x) - f^\\star}{\\\|\\nabla f(x)\\\|^2 + \\epsilon},
 \\gamma\_{\\max}\\right\\}\\,,

 where :math:\`f\` is the function from which a gradient is computed,
 :math:\`\\gamma\_{\\max}\` is a maximal acceptable learning rate set by
 \`\`max\_learning\_rate\`\`, :math:\`\\epsilon\` is a constant preventing division by
 zero set with \`\`eps\`\`, :math:\`s\` scales the formula by \`\`scaling\`\`, and
 :math:\`f^\\star\` is a guess of the minimum value of the function set with
 \`\`f\_min\`\`.

 Setting \`\`variant="sps+"\`\` (Garrigos et al. 2023) uses only the non-negative
 part of the suboptimality gap. That is, it replaces :math:\`f(x) - f^\\star\`
 with :math:\`(f(x) - f^\\star)\_+\`, where :math:\`a\_+ = \\max \\{x, 0\\}\`.

 Args:
 max\_learning\_rate: a maximum step size to use (defaults to 1).
 scaling: A global scaling factor, either fixed or evolving along iterations
 with a scheduler (defaults to 1).
 f\_min: a lower bound on the objective function (defaults to 0). Corresponds
 to :math:\`f^\\star\` in the formula above.
 eps: a value to add in the denominator of the update (defaults to 0).
 variant: either \`\`'sps'\`\` or \`\`'sps+'\`\` (defaults to \`\`'sps'\`\`).

 Returns:
 A :class:\`optax.GradientTransformationExtraArgs\`, where the \`\`update\`\`
 functiontakes an additional keyword argument \`\`value\`\` containing the
 current value of the objective function.

 Examples:
 >>\> import optax
 >>\> import jax
 >>\> import jax.numpy as jnp
 >>\> def f(x): return jnp.sum(x \*\* 2) # simple quadratic function
 >>\> solver = optax.polyak\_sgd()
 >>\> params = jnp.array(\[1., 2., 3.\])
 >>\> print('Objective function: ', f(params))
 Objective function: 14.0
 >>\> opt\_state = solver.init(params)
 >>\> for \_ in range(5):
 ... value, grad = jax.value\_and\_grad(f)(params)
 ... params, opt\_state = solver.update(grad, opt\_state, params, value=value)
 ... print('Objective function: ', f(params))
 Objective function: 3.5
 Objective function: 0.875
 Objective function: 0.21875
 Objective function: 0.0546875
 Objective function: 0.013671875

 References:
 Loizou et al. \`Stochastic polyak step-size for SGD: An adaptive learning
 rate for fast convergence \`\_, 2021

 Berrada et al., \`Training neural networks for and by interpolation
 \`\_, 2020

 Garrigos et al., \`Function value learning: Adaptive learning rates based on
 the Polyak stepsize and function splitting in ERM
 \`\_, 2023

 .. warning::
 This method requires knowledge of an approximate value of the
 objective function minimum, passed through the \`\`f\_min\`\` argument.
 For models that interpolate the data, this can be set to 0 (default
 value).
 Failing to set an appropriate value for \`\`f\_min\`\` can lead to
 divergence or convergence to a suboptimal solution.
 """
 return combine.chain(
 sgd(learning\_rate=scaling),
 transform.scale\_by\_polyak(
 max\_learning\_rate=max\_learning\_rate,
 f\_min=f\_min,
 eps=eps,
 variant=variant,
 ),
 )

def lbfgs(
 learning\_rate: Optional\[base.ScalarOrSchedule\] = None,
 memory\_size: int = 10,
 scale\_init\_precond: bool = True,
 linesearch: Optional\[\
 Union\[base.GradientTransformationExtraArgs, base.GradientTransformation\]\
 \] = \_linesearch.scale\_by\_zoom\_linesearch(
 max\_linesearch\_steps=20, initial\_guess\_strategy='one'
 ),
) -\> base.GradientTransformationExtraArgs:
 r"""L-BFGS optimizer.

 L-BFGS is a quasi-Newton method that multiplies the update (gradient)
 with an approximation of the inverse Hessian. This algorithm does not need
 access to the Hessian, as this approximation is constructed from the gradient
 evaluations seen during optimization. L-BFGS is a limited-memory variant of
 the Broyden-Fletcher-Goldfarb-Shanno (BFGS) algorithm. The BFGS algorithm
 requires storing a matrix of size :math:\`p \\times p\` with :math:\`p\` the
 dimension of the parameters.
 The limited variant circumvents this issue by computing the approximation of
 the inverse using only :math:\`m\` (\`\`memory\_size\`\`) past differences of
 parameters/gradients. Namely, the approximation of the Hessian inverse is
 denoted :math:\`P\_k = P\_{k, k}\`, where

 .. math::

 \\begin{align\*}
 P\_{k, j+1} & = V\_j^\\top P\_{k, j} V\_j + \\rho\_j \\delta w\_j \\delta w\_j^\\top
 \\quad \\text{for} \ j \\in \\{k-m, \\ldots, k-1\\}\\\
 P\_{k, k-m} & = \\gamma\_k I \\\
 V\_k & = I - \\rho\_k \\delta u\_k \\delta w\_k^\\top \\\
 \\rho\_k & = 1/(\\delta u\_k^\\top \\delta w\_k) \