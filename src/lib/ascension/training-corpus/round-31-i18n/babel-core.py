# Content from https://raw.githubusercontent.com/python-babel/babel/master/babel/core.py

"""
babel.core
~~~~~~~~~~

Core locale representation and locale data access.

:copyright: (c) 2013-2026 by the Babel Team.
:license: BSD, see LICENSE for more details.
"""

from \_\_future\_\_ import annotations

import os
import pickle
from collections.abc import Iterable, Mapping
from typing import TYPE\_CHECKING, Any, Literal

from babel import localedata
from babel.plural import PluralRule

\_\_all\_\_ = \[\
 'Locale',\
 'UnknownLocaleError',\
 'default\_locale',\
 'get\_cldr\_version',\
 'get\_global',\
 'get\_locale\_identifier',\
 'negotiate\_locale',\
 'parse\_locale',\
\]

if TYPE\_CHECKING:
 from typing\_extensions import TypeAlias

 \_GLOBAL\_KEY: TypeAlias = Literal\[\
 "all\_currencies",\
 "cldr",\
 "currency\_fractions",\
 "language\_aliases",\
 "likely\_subtags",\
 "meta\_zones",\
 "parent\_exceptions",\
 "script\_aliases",\
 "territory\_aliases",\
 "territory\_currencies",\
 "territory\_languages",\
 "territory\_zones",\
 "variant\_aliases",\
 "windows\_zone\_mapping",\
 "zone\_aliases",\
 "zone\_territories",\
 \]

 \_global\_data: Mapping\[\_GLOBAL\_KEY, Mapping\[str, Any\]\] \| None

\_global\_data = None
\_default\_plural\_rule = PluralRule({})

def \_raise\_no\_data\_error():
 raise RuntimeError(
 'The babel data files are not available. '
 'This usually happens because you are using '
 'a source checkout from Babel and you did '
 'not build the data files. Just make sure '
 'to run "python setup.py import\_cldr" before '
 'installing the library.',
 )

def get\_global(key: \_GLOBAL\_KEY) -> Mapping\[str, Any\]:
 """Return the dictionary for the given key in the global data.

 The global data is stored in the \`\`babel/global.dat\`\` file and contains
 information independent of individual locales.

 >>\> get\_global('zone\_aliases')\['UTC'\]
 'Etc/UTC'
 >>\> get\_global('zone\_territories')\['Europe/Berlin'\]
 'DE'

 The keys available are:

 \- \`\`all\_currencies\`\`
 \- \`\`cldr\`\` (metadata)
 \- \`\`currency\_fractions\`\`
 \- \`\`language\_aliases\`\`
 \- \`\`likely\_subtags\`\`
 \- \`\`parent\_exceptions\`\`
 \- \`\`script\_aliases\`\`
 \- \`\`territory\_aliases\`\`
 \- \`\`territory\_currencies\`\`
 \- \`\`territory\_languages\`\`
 \- \`\`territory\_zones\`\`
 \- \`\`variant\_aliases\`\`
 \- \`\`windows\_zone\_mapping\`\`
 \- \`\`zone\_aliases\`\`
 \- \`\`zone\_territories\`\`

 .. note:: The internal structure of the data may change between versions.

 .. versionadded:: 0.9

 :param key: the data key
 """
 global \_global\_data
 if \_global\_data is None:
 dirname = os.path.join(os.path.dirname(\_\_file\_\_))
 filename = os.path.join(dirname, 'global.dat')
 if not os.path.isfile(filename):
 \_raise\_no\_data\_error()
 with open(filename, 'rb') as fileobj:
 \_global\_data = pickle.load(fileobj)
 assert \_global\_data is not None
 return \_global\_data.get(key, {})

LOCALE\_ALIASES = {
 'ar': 'ar\_SY', 'bg': 'bg\_BG', 'bs': 'bs\_BA', 'ca': 'ca\_ES', 'cs': 'cs\_CZ',
 'da': 'da\_DK', 'de': 'de\_DE', 'el': 'el\_GR', 'en': 'en\_US', 'es': 'es\_ES',
 'et': 'et\_EE', 'fa': 'fa\_IR', 'fi': 'fi\_FI', 'fr': 'fr\_FR', 'gl': 'gl\_ES',
 'he': 'he\_IL', 'hu': 'hu\_HU', 'id': 'id\_ID', 'is': 'is\_IS', 'it': 'it\_IT',
 'ja': 'ja\_JP', 'km': 'km\_KH', 'ko': 'ko\_KR', 'lt': 'lt\_LT', 'lv': 'lv\_LV',
 'mk': 'mk\_MK', 'nl': 'nl\_NL', 'nn': 'nn\_NO', 'no': 'nb\_NO', 'pl': 'pl\_PL',
 'pt': 'pt\_PT', 'ro': 'ro\_RO', 'ru': 'ru\_RU', 'sk': 'sk\_SK', 'sl': 'sl\_SI',
 'sv': 'sv\_SE', 'th': 'th\_TH', 'tr': 'tr\_TR', 'uk': 'uk\_UA',
} # fmt: skip

class UnknownLocaleError(Exception):
 """Exception thrown when a locale is requested for which no locale data
 is available.
 """

 def \_\_init\_\_(self, identifier: str) -> None:
 """Create the exception.

 :param identifier: the identifier string of the unsupported locale
 """
 Exception.\_\_init\_\_(self, f"unknown locale {identifier!r}")

 #: The identifier of the locale that could not be found.
 self.identifier = identifier

class Locale:
 """Representation of a specific locale.

 >>\> locale = Locale('en', 'US')
 >>\> repr(locale)
 "Locale('en', territory='US')"
 >>\> locale.display\_name
 'English (United States)'

 A \`Locale\` object can also be instantiated from a raw locale string:

 >>\> locale = Locale.parse('en-US', sep='-')
 >>\> repr(locale)
 "Locale('en', territory='US')"

 \`Locale\` objects provide access to a collection of locale data, such as
 territory and language names, number and date format patterns, and more:

 >>\> locale.number\_symbols\['latn'\]\['decimal'\]
 '.'

 If a locale is requested for which no locale data is available, an
 \`UnknownLocaleError\` is raised:

 >>\> Locale.parse('en\_XX')
 Traceback (most recent call last):
 ...
 UnknownLocaleError: unknown locale 'en\_XX'

 For more information see :rfc:\`3066\`.
 """

 def \_\_init\_\_(
 self,
 language: str,
 territory: str \| None = None,
 script: str \| None = None,
 variant: str \| None = None,
 modifier: str \| None = None,
 ) -\> None:
 """Initialize the locale object from the given identifier components.

 >>\> locale = Locale('en', 'US')
 >>\> locale.language
 'en'
 >>\> locale.territory
 'US'

 :param language: the language code
 :param territory: the territory (country or region) code
 :param script: the script code
 :param variant: the variant code
 :param modifier: a modifier (following the '@' symbol, sometimes called '@variant')
 :raise \`UnknownLocaleError\`: if no locale data is available for the
 requested locale
 """
 #: the language code
 self.language = language
 #: the territory (country or region) code
 self.territory = territory
 #: the script code
 self.script = script
 #: the variant code
 self.variant = variant
 #: the modifier
 self.modifier = modifier
 self.\_\_data: localedata.LocaleDataDict \| None = None

 identifier = str(self)
 identifier\_without\_modifier = identifier.partition('@')\[0\]
 if localedata.exists(identifier):
 self.\_\_data\_identifier = identifier
 elif localedata.exists(identifier\_without\_modifier):
 self.\_\_data\_identifier = identifier\_without\_modifier
 else:
 raise UnknownLocaleError(identifier)

 @classmethod
 def default(
 cls,
 category: str \| None = None,
 aliases: Mapping\[str, str\] = LOCALE\_ALIASES,
 ) -\> Locale:
 """Return the system default locale for the specified category.

 >>\> for name in \['LANGUAGE', 'LC\_ALL', 'LC\_CTYPE', 'LC\_MESSAGES'\]:
 ... os.environ\[name\] = ''
 >>\> os.environ\['LANG'\] = 'fr\_FR.UTF-8'
 >>\> Locale.default('LC\_MESSAGES')
 Locale('fr', territory='FR')

 The following fallbacks to the variable are always considered:

 \- \`\`LANGUAGE\`\`
 \- \`\`LC\_ALL\`\`
 \- \`\`LC\_CTYPE\`\`
 \- \`\`LANG\`\`

 :param category: one of the \`\`LC\_XXX\`\` environment variable names
 :param aliases: a dictionary of aliases for locale identifiers
 """
 # XXX: use likely subtag expansion here instead of the
 # aliases dictionary.
 locale\_string = default\_locale(category, aliases=aliases)
 return cls.parse(locale\_string)

 @classmethod
 def negotiate(
 cls,
 preferred: Iterable\[str\],
 available: Iterable\[str\],
 sep: str = '\_',
 aliases: Mapping\[str, str\] = LOCALE\_ALIASES,
 ) -\> Locale \| None:
 """Find the best match between available and requested locale strings.

 >>\> Locale.negotiate(\['de\_DE', 'en\_US'\], \['de\_DE', 'de\_AT'\])
 Locale('de', territory='DE')
 >>\> Locale.negotiate(\['de\_DE', 'en\_US'\], \['en', 'de'\])
 Locale('de')
 >>\> Locale.negotiate(\['de\_DE', 'de'\], \['en\_US'\])

 You can specify the character used in the locale identifiers to separate
 the different components. This separator is applied to both lists. Also,
 case is ignored in the comparison:

 >>\> Locale.negotiate(\['de-DE', 'de'\], \['en-us', 'de-de'\], sep='-')
 Locale('de', territory='DE')

 :param preferred: the list of locale identifiers preferred by the user
 :param available: the list of locale identifiers available
 :param aliases: a dictionary of aliases for locale identifiers
 :param sep: separator for parsing; e.g. Windows tends to use '-' instead of '\_'.
 """
 identifier = negotiate\_locale(preferred, available, sep=sep, aliases=aliases)
 if identifier:
 return Locale.parse(identifier, sep=sep)
 return None

 @classmethod
 def parse(
 cls,
 identifier: Locale \| str \| None,
 sep: str = '\_',
 resolve\_likely\_subtags: bool = True,
 ) -\> Locale:
 """Create a \`Locale\` instance for the given locale identifier.

 >>\> l = Locale.parse('de-DE', sep='-')
 >>\> l.display\_name
 'Deutsch (Deutschland)'

 If the \`identifier\` parameter is not a string, but actually a \`Locale\`
 object, that object is returned:

 >>\> Locale.parse(l)
 Locale('de', territory='DE')

 If the \`identifier\` parameter is neither of these, such as \`None\`
 or an empty string, e.g. because a default locale identifier
 could not be determined, a \`TypeError\` is raised:

 >>\> Locale.parse(None)
 Traceback (most recent call last):
 ...
 TypeError: ...

 This also can perform resolving of likely subtags which it does
 by default. This is for instance useful to figure out the most
 likely locale for a territory you can use \`\`'und'\`\` as the
 language tag:

 >>\> Locale.parse('und\_AT')
 Locale('de', territory='AT')

 Modifiers are optional, and always at the end, separated by "@":

 >>\> Locale.parse('de\_AT@euro')
 Locale('de', territory='AT', modifier='euro')

 :param identifier: the locale identifier string
 :param sep: optional component separator
 :param resolve\_likely\_subtags: if this is specified then a locale will
 have its likely subtag resolved if the
 locale otherwise does not exist. For
 instance \`\`zh\_TW\`\` by itself is not a
 locale that exists but Babel can
 automatically expand it to the full
 form of \`\`zh\_hant\_TW\`\`. Note that this
 expansion is only taking place if no
 locale exists otherwise. For instance
 there is a locale \`\`en\`\` that can exist
 by itself.
 :raise \`ValueError\`: if the string does not appear to be a valid locale
 identifier
 :raise \`UnknownLocaleError\`: if no locale data is available for the
 requested locale
 :raise \`TypeError\`: if the identifier is not a string or a \`Locale\`
 :raise \`ValueError\`: if the identifier is not a valid string
 """
 if isinstance(identifier, Locale):
 return identifier

 if not identifier:
 msg = (
 f"Empty locale identifier value: {identifier!r}\\n\\n"
 f"If you didn't explicitly pass an empty value to a Babel function, "
 f"this could be caused by there being no suitable locale environment "
 f"variables for the API you tried to use."
 )
 if isinstance(identifier, str):
 # \`parse\_locale\` would raise a ValueError, so let's do that here
 raise ValueError(msg)
 raise TypeError(msg)

 if not isinstance(identifier, str):
 raise TypeError(f"Unexpected value for identifier: {identifier!r}")

 parts = parse\_locale(identifier, sep=sep)
 input\_id = get\_locale\_identifier(parts)

 def \_try\_load(parts):
 try:
 return cls(\*parts)
 except UnknownLocaleError:
 return None

 def \_try\_load\_reducing(parts):
 # Success on first hit, return it.
 locale = \_try\_load(parts)
 if locale is not None:
 return locale

 # Now try without script and variant
 locale = \_try\_load(parts\[:2\])
 if locale is not None:
 return locale

 locale = \_try\_load(parts)
 if locale is not None:
 return locale
 if not resolve\_likely\_subtags:
 raise UnknownLocaleError(input\_id)

 # From here onwards is some very bad likely subtag resolving. This
 # whole logic is not entirely correct but good enough (tm) for the
 # time being. This has been added so that zh\_TW does not cause
 # errors for people when they upgrade. Later we should properly
 # implement ICU like fuzzy locale objects and provide a way to
 # maximize and minimize locale tags.

 if len(parts) == 5:
 language, territory, script, variant, modifier = parts
 else:
 language, territory, script, variant = parts
 modifier = None
 language = get\_global('language\_aliases').get(language, language)
 territory = get\_global('territory\_aliases').get(territory or '', (territory,))\[0\]
 script = get\_global('script\_aliases').get(script or '', script)
 variant = get\_global('variant\_aliases').get(variant or '', variant)

 if territory == 'ZZ':
 territory = None
 if script == 'Zzzz':
 script = None

 parts = language, territory, script, variant, modifier

 # First match: try the whole identifier
 new\_id = get\_locale\_identifier(parts)
 likely\_subtag = get\_global('likely\_subtags').get(new\_id)
 if likely\_subtag is not None:
 locale = \_try\_load\_reducing(parse\_locale(likely\_subtag))
 if locale is not None:
 return locale

 # If we did not find anything so far, try again with a
 # simplified identifier that is just the language
 likely\_subtag = get\_global('likely\_subtags').get(language)
 if likely\_subtag is not None:
 parts2 = parse\_locale(likely\_subtag)
 if len(parts2) == 5:
 language2, \_, script2, variant2, modifier2 = parts2
 else:
 language2, \_, script2, variant2 = parts2
 modifier2 = None
 locale = \_try\_load\_reducing(
 (language2, territory, script2, variant2, modifier2),
 )
 if locale is not None:
 return locale

 raise UnknownLocaleError(input\_id)

 def \_\_eq\_\_(self, other: object) -> bool:
 for key in ('language', 'territory', 'script', 'variant', 'modifier'):
 if not hasattr(other, key):
 return False
 return (
 self.language == getattr(other, 'language') # noqa: B009
 and self.territory == getattr(other, 'territory') # noqa: B009
 and self.script == getattr(other, 'script') # noqa: B009
 and self.variant == getattr(other, 'variant') # noqa: B009
 and self.modifier == getattr(other, 'modifier') # noqa: B009
 )

 def \_\_ne\_\_(self, other: object) -> bool:
 return not self.\_\_eq\_\_(other)

 def \_\_hash\_\_(self) -> int:
 return hash((self.language, self.territory, self.script, self.variant, self.modifier))

 def \_\_repr\_\_(self) -> str:
 parameters = \[''\]
 for key in ('territory', 'script', 'variant', 'modifier'):
 value = getattr(self, key)
 if value is not None:
 parameters.append(f"{key}={value!r}")
 return f"Locale({self.language!r}{', '.join(parameters)})"

 def \_\_str\_\_(self) -> str:
 return get\_locale\_identifier(
 (self.language, self.territory, self.script, self.variant, self.modifier),
 )

 @property
 def \_data(self) -> localedata.LocaleDataDict:
 if self.\_\_data is None:
 self.\_\_data = localedata.LocaleDataDict(localedata.load(self.\_\_data\_identifier))
 return self.\_\_data

 def get\_display\_name(self, locale: Locale \| str \| None = None) -> str \| None:
 """Return the display name of the locale using the given locale.

 The display name will include the language, territory, script, and
 variant, if those are specified.

 >>\> Locale('zh', 'CN', script='Hans').get\_display\_name('en')
 'Chinese (Simplified, China)'

 Modifiers are currently passed through verbatim:

 >>\> Locale('it', 'IT', modifier='euro').get\_display\_name('en')
 'Italian (Italy, euro)'

 :param locale: the locale to use
 """
 if locale is None:
 locale = self
 locale = Locale.parse(locale)
 retval = locale.languages.get(self.language)
 if retval and (self.territory or self.script or self.variant):
 details = \[\]
 if self.script:
 details.append(locale.scripts.get(self.script))
 if self.territory:
 details.append(locale.territories.get(self.territory))
 if self.variant:
 details.append(locale.variants.get(self.variant))
 if self.modifier:
 details.append(self.modifier)
 detail\_string = ', '.join(atom for atom in details if atom)
 if detail\_string:
 retval += f" ({detail\_string})"
 return retval

 display\_name = property(
 get\_display\_name,
 doc="""\
 The localized display name of the locale.

 >>\> Locale('en').display\_name
 'English'
 >>\> Locale('en', 'US').display\_name
 'English (United States)'
 >>\> Locale('sv').display\_name
 'svenska'

 :type: \`unicode\`
 """,
 )

 def get\_language\_name(self, locale: Locale \| str \| None = None) -> str \| None:
 """Return the language of this locale in the given locale.

 >>\> Locale('zh', 'CN', script='Hans').get\_language\_name('de')
 'Chinesisch'

 .. versionadded:: 1.0

 :param locale: the locale to use
 """
 if locale is None:
 locale = self
 locale = Locale.parse(locale)
 return locale.languages.get(self.language)

 language\_name = property(
 get\_language\_name,
 doc="""\
 The localized language name of the locale.

 >>\> Locale('en', 'US').language\_name
 'English'
 """,
 )

 def get\_territory\_name(self, locale: Locale \| str \| None = None) -> str \| None:
 """Return the territory name in the given locale."""
 if locale is None:
 locale = self
 locale = Locale.parse(locale)
 return locale.territories.get(self.territory or '')

 territory\_name = property(
 get\_territory\_name,
 doc="""\
 The localized territory name of the locale if available.

 >>\> Locale('de', 'DE').territory\_name
 'Deutschland'
 """,
 )

 def get\_script\_name(self, locale: Locale \| str \| None = None) -> str \| None:
 """Return the script name in the given locale."""
 if locale is None:
 locale = self
 locale = Locale.parse(locale)
 return locale.scripts.get(self.script or '')

 script\_name = property(
 get\_script\_name,
 doc="""\
 The localized script name of the locale if available.

 >>\> Locale('sr', 'ME', script='Latn').script\_name
 'latinica'
 """,
 )

 @property
 def english\_name(self) -> str \| None:
 """The english display name of the locale.

 >>\> Locale('de').english\_name
 'German'
 >>\> Locale('de', 'DE').english\_name
 'German (Germany)'

 :type: \`unicode\`"""
 return self.get\_display\_name(Locale('en'))

 # { General Locale Display Names

 @property
 def languages(self) -> localedata.LocaleDataDict:
 """Mapping of language codes to translated language names.

 >>\> Locale('de', 'DE').languages\['ja'\]
 'Japanisch'

 See \`ISO 639 \`\_ for
 more information.
 """
 return self.\_data\['languages'\]

 @property
 def scripts(self) -> localedata.LocaleDataDict:
 """Mapping of script codes to translated script names.

 >>\> Locale('en', 'US').scripts\['Hira'\]
 'Hiragana'

 See \`ISO 15924 \`\_
 for more information.
 """
 return self.\_data\['scripts'\]

 @property
 def territories(self) -> localedata.LocaleDataDict:
 """Mapping of script codes to translated script names.

 >>\> Locale('es', 'CO').territories\['DE'\]
 'Alemania'

 See \`ISO 3166 \`\_
 for more information.
 """
 return self.\_data\['territories'\]

 @property
 def variants(self) -> localedata.LocaleDataDict:
 """Mapping of script codes to translated script names.

 >>\> Locale('de', 'DE').variants\['1901'\]
 'Alte deutsche Rechtschreibung'
 """
 return self.\_data\['variants'\]

 # { Number Formatting

 @property
 def currencies(self) -> localedata.LocaleDataDict:
 """Mapping of currency codes to translated currency names. This
 only returns the generic form of the currency name, not the count
 specific one. If an actual number is requested use the
 :func:\`babel.numbers.get\_currency\_name\` function.

 >>\> Locale('en').currencies\['COP'\]
 'Colombian Peso'
 >>\> Locale('de', 'DE').currencies\['COP'\]
 'Kolumbianischer Peso'
 """
 return self.\_data\['currency\_names'\]

 @property
 def currency\_symbols(self) -> localedata.LocaleDataDict:
 """Mapping of currency codes to symbols.

 >>\> Locale('en', 'US').currency\_symbols\['USD'\]
 '$'
 >>\> Locale('es', 'CO').currency\_symbols\['USD'\]
 'US$'
 """
 return self.\_data\['currency\_symbols'\]

 @property
 def number\_symbols(self) -> localedata.LocaleDataDict:
 """Symbols used in number formatting by number system.

 .. note:: The format of the value returned may change between
 Babel versions.

 >>\> Locale('fr', 'FR').number\_symbols\["latn"\]\['decimal'\]
 ','
 >>\> Locale('fa', 'IR').number\_symbols\["arabext"\]\['decimal'\]
 '٫'
 >>\> Locale('fa', 'IR').number\_symbols\["latn"\]\['decimal'\]
 '.'
 """
 return self.\_data\['number\_symbols'\]

 @property
 def other\_numbering\_systems(self) -> localedata.LocaleDataDict:
 """
 Mapping of other numbering systems available for the locale.
 See: https://www.unicode.org/reports/tr35/tr35-numbers.html#otherNumberingSystems

 >>\> Locale('el', 'GR').other\_numbering\_systems\['traditional'\]
 'grek'

 .. note:: The format of the value returned may change between
 Babel versions.
 """
 return self.\_data\['numbering\_systems'\]

 @property
 def default\_numbering\_system(self) -> str:
 """The default numbering system used by the locale.
 >>\> Locale('el', 'GR').default\_numbering\_system
 'latn'
 """
 return self.\_data\['default\_numbering\_system'\]

 @property
 def decimal\_formats(self) -> localedata.LocaleDataDict:
 """Locale patterns for decimal number formatting.

 .. note:: The format of the value returned may change between
 Babel versions.

 >>\> Locale('en', 'US').decimal\_formats\[None\]

 """
 return self.\_data\['decimal\_formats'\]

 @property
 def compact\_decimal\_formats(self) -> localedata.LocaleDataDict:
 """Locale patterns for compact decimal number formatting.

 .. note:: The format of the value returned may change between
 Babel versions.

 >>\> Locale('en', 'US').compact\_decimal\_formats\["short"\]\["one"\]\["1000"\]

 """
 return self.\_data\['compact\_decimal\_formats'\]

 @property
 def currency\_formats(self) -> localedata.LocaleDataDict:
 """Locale patterns for currency number formatting.

 .. note:: The format of the value returned may change between
 Babel versions.

 >>\> Locale('en', 'US').currency\_formats\['standard'\]

 >>\> Locale('en', 'US').currency\_formats\['accounting'\]

 """
 return self.\_data\['currency\_formats'\]

 @property
 def compact\_currency\_formats(self) -> localedata.LocaleDataDict:
 """Locale patterns for compact currency number formatting.

 .. note:: The format of the value returned may change between
 Babel versions.

 >>\> Locale('en', 'US').compact\_currency\_formats\["short"\]\["one"\]\["1000"\]

 """
 return self.\_data\['compact\_currency\_formats'\]

 @property
 def percent\_formats(self) -> localedata.LocaleDataDict:
 """Locale patterns for percent number formatting.

 .. note:: The format of the value returned may change between
 Babel versions.

 >>\> Locale('en', 'US').percent\_formats\[None\]

 """
 return self.\_data\['percent\_formats'\]

 @property
 def scientific\_formats(self) -> localedata.LocaleDataDict:
 """Locale patterns for scientific number formatting.

 .. note:: The format of the value returned may change between
 Babel versions.

 >>\> Locale('en', 'US').scientific\_formats\[None\]

 """
 return self.\_data\['scientific\_formats'\]

 # { Calendar Information and Date Formatting

 @property
 def periods(self) -> localedata.LocaleDataDict:
 """Locale display names for day periods (AM/PM).

 >>\> Locale('en', 'US').periods\['am'\]
 'AM'
 """
 try:
 return self.\_data\['day\_periods'\]\['stand-alone'\]\['wide'\]
 except KeyError:
 return localedata.LocaleDataDict({}) # pragma: no cover

 @property
 def day\_periods(self) -> localedata.LocaleDataDict:
 """Locale display names for various day periods (not necessarily only AM/PM).

 These are not meant to be used without the relevant \`day\_period\_rules\`.
 """
 return self.\_data\['day\_periods'\]

 @property
 def day\_period\_rules(self) -> localedata.LocaleDataDict:
 """Day period rules for the locale. Used by \`get\_period\_id\`."""
 return self.\_data.get('day\_period\_rules', localedata.LocaleDataDict({}))

 @property
 def days(self) -> localedata.LocaleDataDict:
 """Locale display names for weekdays.

 >>\> Locale('de', 'DE').days\['format'\]\['wide'\]\[3\]
 'Donnerstag'
 """
 return self.\_data\['days'\]

 @property
 def months(self) -> localedata.LocaleDataDict:
 """Locale display names for months.

 >>\> Locale('de', 'DE').months\['format'\]\['wide'\]\[10\]
 'Oktober'
 """
 return self.\_data\['months'\]

 @property
 def quarters(self) -> localedata.LocaleDataDict:
 """Locale display names for quarters.

 >>\> Locale('de', 'DE').quarters\['format'\]\['wide'\]\[1\]
 '1\. Quartal'
 """
 return self.\_data\['quarters'\]

 @property
 def eras(self) -> localedata.LocaleDataDict:
 """Locale display names for eras.

 .. note:: The format of the value returned may change between
 Babel versions.

 >>\> Locale('en', 'US').eras\['wide'\]\[1\]
 'Anno Domini'
 >>\> Locale('en', 'US').eras\['abbreviated'\]\[0\]
 'BC'
 """
 return self.\_data\['eras'\]

 @property
 def time\_zones(self) -> localedata.LocaleDataDict:
 """Locale display names for time zones.

 .. note:: The format of the value returned may change between
 Babel versions.

 >>\> Locale('en', 'US').time\_zones\['Europe/London'\]\['long'\]\['daylight'\]
 'British Summer Time'
 >>\> Locale('en', 'US').time\_zones\['America/St\_Johns'\]\['city'\]
 'St. John’s'
 """
 return self.\_data\['time\_zones'\]

 @property
 def meta\_zones(self) -> localedata.LocaleDataDict:
 """Locale display names for meta time zones.

 Meta time zones are basically groups of different Olson time zones that
 have the same GMT offset and daylight savings time.

 .. note:: The format of the value returned may change between
 Babel versions.

 >>\> Locale('en', 'US').meta\_zones\['Europe\_Central'\]\['long'\]\['daylight'\]
 'Central European Summer Time'

 .. versionadded:: 0.9
 """
 return self.\_data\['meta\_zones'\]

 @property
 def zone\_formats(self) -> localedata.LocaleDataDict:
 """Patterns related to the formatting of time zones.

 .. note:: The format of the value returned may change between
 Babel versions.

 >>\> Locale('en', 'US').zone\_formats\['fallback'\]
 '%(1)s (%(0)s)'
 >>\> Locale('pt', 'BR').zone\_formats\['region'\]
 'Horário %s'

 .. versionadded:: 0.9
 """
 return self.\_data\['zone\_formats'\]

 @property
 def first\_week\_day(self) -> int:
 """The first day of a week, with 0 being Monday.

 >>\> Locale('de', 'DE').first\_week\_day
 0
 >>\> Locale('en', 'US').first\_week\_day
 6
 """
 return self.\_data\['week\_data'\]\['first\_day'\]

 @property
 def weekend\_start(self) -> int:
 """The day the weekend starts, with 0 being Monday.

 >>\> Locale('de', 'DE').weekend\_start
 5
 """
 return self.\_data\['week\_data'\]\['weekend\_start'\]

 @property
 def weekend\_end(self) -> int:
 """The day the weekend ends, with 0 being Monday.

 >>\> Locale('de', 'DE').weekend\_end
 6
 """
 return self.\_data\['week\_data'\]\['weekend\_end'\]

 @property
 def min\_week\_days(self) -> int:
 """The minimum number of days in a week so that the week is counted as
 the first week of a year or month.

 >>\> Locale('de', 'DE').min\_week\_days
 4
 """
 return self.\_data\['week\_data'\]\['min\_days'\]

 @property
 def date\_formats(self) -> localedata.LocaleDataDict:
 """Locale patterns for date formatting.

 .. note:: The format of the value returned may change between
 Babel versions.

 >>\> Locale('en', 'US').date\_formats\['short'\]

 >>\> Locale('fr', 'FR').date\_formats\['long'\]

 """
 return self.\_data\['date\_formats'\]

 @property
 def time\_formats(self) -> localedata.LocaleDataDict:
 """Locale patterns for time formatting.

 .. note:: The format of the value returned may change between
 Babel versions.

 >>\> Locale('en', 'US').time\_formats\['short'\]

 >>\> Locale('fr', 'FR').time\_formats\['long'\]

 """
 return self.\_data\['time\_formats'\]

 @property
 def datetime\_formats(self) -> localedata.LocaleDataDict:
 """Locale patterns for datetime formatting.

 .. note:: The format of the value returned may change between
 Babel versions.

 >>\> Locale('en').datetime\_formats\['full'\]
 '{1}, {0}'
 >>\> Locale('th').datetime\_formats\['medium'\]
 '{1} {0}'
 """
 return self.\_data\['datetime\_formats'\]

 @property
 def datetime\_skeletons(self) -> localedata.LocaleDataDict:
 """Locale patterns for formatting parts of a datetime.

 >>\> Locale('en').datetime\_skeletons\['MEd'\]

 >>\> Locale('fr').datetime\_skeletons\['MEd'\]

 >>\> Locale('fr').datetime\_skeletons\['H'\]

 """
 return self.\_data\['datetime\_skeletons'\]

 @property
 def interval\_formats(self) -> localedata.LocaleDataDict:
 """Locale patterns for interval formatting.

 .. note:: The format of the value returned may change between
 Babel versions.

 How to format date intervals in Finnish when the day is the
 smallest changing component:

 >>\> Locale('fi\_FI').interval\_formats\['MEd'\]\['d'\]
 \['E d.\\\u2009–\\\u2009', 'E d.M.'\]

 .. seealso::

 The primary API to use this data is :py:func:\`babel.dates.format\_interval\`.

 :rtype: dict\[str, dict\[str, list\[str\]\]\]
 """
 return self.\_data\['interval\_formats'\]

 @property
 def plural\_form(self) -> PluralRule:
 """Plural rules for the locale.

 >>\> Locale('en').plural\_form(1)
 'one'
 >>\> Locale('en').plural\_form(0)
 'other'
 >>\> Locale('fr').plural\_form(0)
 'one'
 >>\> Locale('ru').plural\_form(100)
 'many'
 """
 return self.\_data.get('plural\_form', \_default\_plural\_rule)

 @property
 def list\_patterns(self) -> localedata.LocaleDataDict:
 """Patterns for generating lists

 .. note:: The format of the value returned may change between
 Babel versions.

 >>\> Locale('en').list\_patterns\['standard'\]\['start'\]
 '{0}, {1}'
 >>\> Locale('en').list\_patterns\['standard'\]\['end'\]
 '{0}, and {1}'
 >>\> Locale('en\_GB').list\_patterns\['standard'\]\['end'\]
 '{0} and {1}'
 """
 return self.\_data\['list\_patterns'\]

 @property
 def ordinal\_form(self) -> PluralRule:
 """Plural rules for the locale.

 >>\> Locale('en').ordinal\_form(1)
 'one'
 >>\> Locale('en').ordinal\_form(2)
 'two'
 >>\> Locale('en').ordinal\_form(3)
 'few'
 >>\> Locale('fr').ordinal\_form(2)
 'other'
 >>\> Locale('ru').ordinal\_form(100)
 'other'
 """
 return self.\_data.get('ordinal\_form', \_default\_plural\_rule)

 @property
 def measurement\_systems(self) -> localedata.LocaleDataDict:
 """Localized names for various measurement systems.

 >>\> Locale('fr', 'FR').measurement\_systems\['US'\]
 'américain'
 >>\> Locale('en', 'US').measurement\_systems\['US'\]
 'US'

 """
 return self.\_data\['measurement\_systems'\]

 @property
 def character\_order(self) -> str:
 """The text direction for the language.

 >>\> Locale('de', 'DE').character\_order
 'left-to-right'
 >>\> Locale('ar', 'SA').character\_order
 'right-to-left'
 """
 return self.\_data\['character\_order'\]

 @property
 def text\_direction(self) -> str:
 """The text direction for the language in CSS short-hand form.

 >>\> Locale('de', 'DE').text\_direction
 'ltr'
 >>\> Locale('ar', 'SA').text\_direction
 'rtl'
 """
 return ''.join(word\[0\] for word in self.character\_order.split('-'))

 @property
 def unit\_display\_names(self) -> localedata.LocaleDataDict:
 """Display names for units of measurement.

 .. seealso::

 You may want to use :py:func:\`babel.units.get\_unit\_name\` instead.

 .. note:: The format of the value returned may change between
 Babel versions.

 """
 return self.\_data\['unit\_display\_names'\]

def default\_locale(
 category: str \| tuple\[str, ...\] \| list\[str\] \| None = None,
 aliases: Mapping\[str, str\] = LOCALE\_ALIASES,
) -\> str \| None:
 """Returns the system default locale for a given category, based on
 environment variables.

 >>\> for name in \['LANGUAGE', 'LC\_ALL', 'LC\_CTYPE'\]:
 ... os.environ\[name\] = ''
 >>\> os.environ\['LANG'\] = 'fr\_FR.UTF-8'
 >>\> default\_locale('LC\_MESSAGES')
 'fr\_FR'

 The "C" or "POSIX" pseudo-locales are treated as aliases for the
 "en\_US\_POSIX" locale:

 >>\> os.environ\['LC\_MESSAGES'\] = 'POSIX'
 >>\> default\_locale('LC\_MESSAGES')
 'en\_US\_POSIX'

 The following fallbacks to the variable are always considered:

 \- \`\`LANGUAGE\`\`
 \- \`\`LC\_ALL\`\`
 \- \`\`LC\_CTYPE\`\`
 \- \`\`LANG\`\`

 :param category: one or more of the \`\`LC\_XXX\`\` environment variable names
 :param aliases: a dictionary of aliases for locale identifiers
 """

 varnames = ('LANGUAGE', 'LC\_ALL', 'LC\_CTYPE', 'LANG')
 if category:
 if isinstance(category, str):
 varnames = (category, \*varnames)
 elif isinstance(category, (list, tuple)):
 varnames = (\*category, \*varnames)
 else:
 raise TypeError(f"Invalid type for category: {category!r}")

 for name in varnames:
 if not name:
 continue
 locale = os.getenv(name)
 if locale:
 if name == 'LANGUAGE' and ':' in locale:
 # the LANGUAGE variable may contain a colon-separated list of
 # language codes; we just pick the language on the list
 locale = locale.split(':')\[0\]
 if locale.split('.')\[0\] in ('C', 'POSIX'):
 locale = 'en\_US\_POSIX'
 elif aliases and locale in aliases:
 locale = aliases\[locale\]
 try:
 return get\_locale\_identifier(parse\_locale(locale))
 except ValueError:
 pass
 return None

def negotiate\_locale(
 preferred: Iterable\[str\],
 available: Iterable\[str\],
 sep: str = '\_',
 aliases: Mapping\[str, str\] = LOCALE\_ALIASES,
) -\> str \| None:
 """Find the best match between available and requested locale strings.

 >>\> negotiate\_locale(\['de\_DE', 'en\_US'\], \['de\_DE', 'de\_AT'\])
 'de\_DE'
 >>\> negotiate\_locale(\['de\_DE', 'en\_US'\], \['en', 'de'\])
 'de'

 Case is ignored by the algorithm, the result uses the case of the preferred
 locale identifier:

 >>\> negotiate\_locale(\['de\_DE', 'en\_US'\], \['de\_de', 'de\_at'\])
 'de\_DE'

 >>\> negotiate\_locale(\['de\_DE', 'en\_US'\], \['de\_de', 'de\_at'\])
 'de\_DE'

 By default, some web browsers unfortunately do not include the territory
 in the locale identifier for many locales, and some don't even allow the
 user to easily add the territory. So while you may prefer using qualified
 locale identifiers in your web-application, they would not normally match
 the language-only locale sent by such browsers. To workaround that, this
 function uses a default mapping of commonly used language-only locale
 identifiers to identifiers including the territory:

 >>\> negotiate\_locale(\['ja', 'en\_US'\], \['ja\_JP', 'en\_US'\])
 'ja\_JP'

 Some browsers even use an incorrect or outdated language code, such as "no"
 for Norwegian, where the correct locale identifier would actually be "nb\_NO"
 (Bokmål) or "nn\_NO" (Nynorsk). The aliases are intended to take care of
 such cases, too:

 >>\> negotiate\_locale(\['no', 'sv'\], \['nb\_NO', 'sv\_SE'\])
 'nb\_NO'

 You can override this default mapping by passing a different \`aliases\`
 dictionary to this function, or you can bypass the behavior althogher by
 setting the \`aliases\` parameter to \`None\`.

 :param preferred: the list of locale strings preferred by the user
 :param available: the list of locale strings available
 :param sep: character that separates the different parts of the locale
 strings
 :param aliases: a dictionary of aliases for locale identifiers
 """
 available = \[a.lower() for a in available if a\]
 for locale in preferred:
 ll = locale.lower()
 if ll in available:
 return locale
 if aliases:
 alias = aliases.get(ll)
 if alias:
 alias = alias.replace('\_', sep)
 if alias.lower() in available:
 return alias
 parts = locale.split(sep)
 if len(parts) > 1 and parts\[0\].lower() in available:
 return parts\[0\]
 return None

def parse\_locale(
 identifier: str,
 sep: str = '\_',
) -\> (
 tuple\[str, str \| None, str \| None, str \| None\]
 \| tuple\[str, str \| None, str \| None, str \| None, str \| None\]
):
 """Parse a locale identifier into a tuple of the form \`\`(language,
 territory, script, variant, modifier)\`\`.

 >>\> parse\_locale('zh\_CN')
 ('zh', 'CN', None, None)
 >>\> parse\_locale('zh\_Hans\_CN')
 ('zh', 'CN', 'Hans', None)
 >>\> parse\_locale('ca\_es\_valencia')
 ('ca', 'ES', None, 'VALENCIA')
 >>\> parse\_locale('en\_150')
 ('en', '150', None, None)
 >>\> parse\_locale('en\_us\_posix')
 ('en', 'US', None, 'POSIX')
 >>\> parse\_locale('it\_IT@euro')
 ('it', 'IT', None, None, 'euro')
 >>\> parse\_locale('it\_IT@custom')
 ('it', 'IT', None, None, 'custom')
 >>\> parse\_locale('it\_IT@')
 ('it', 'IT', None, None)

 The default component separator is "\_", but a different separator can be
 specified using the \`sep\` parameter.

 The optional modifier is always separated with "@" and at the end:

 >>\> parse\_locale('zh-CN', sep='-')
 ('zh', 'CN', None, None)
 >>\> parse\_locale('zh-CN@custom', sep='-')
 ('zh', 'CN', None, None, 'custom')

 If the identifier cannot be parsed into a locale, a \`ValueError\` exception
 is raised:

 >>\> parse\_locale('not\_a\_LOCALE\_String')
 Traceback (most recent call last):
 ...
 ValueError: 'not\_a\_LOCALE\_String' is not a valid locale identifier

 Encoding information is removed from the identifier, while modifiers are
 kept:

 >>\> parse\_locale('en\_US.UTF-8')
 ('en', 'US', None, None)
 >>\> parse\_locale('de\_DE.iso885915@euro')
 ('de', 'DE', None, None, 'euro')

 See :rfc:\`4646\` for more information.

 :param identifier: the locale identifier string
 :param sep: character that separates the different components of the locale
 identifier
 :raise \`ValueError\`: if the string does not appear to be a valid locale
 identifier
 """
 if not identifier:
 raise ValueError("empty locale identifier")
 identifier, \_, modifier = identifier.partition('@')
 if '.' in identifier:
 # this is probably the charset/encoding, which we don't care about
 identifier = identifier.split('.', 1)\[0\]

 parts = identifier.split(sep)
 lang = parts.pop(0).lower()
 if not lang.isalpha():
 raise ValueError(f"expected only letters, got {lang!r}")

 script = territory = variant = None
 if parts and len(parts\[0\]) == 4 and parts\[0\].isalpha():
 script = parts.pop(0).title()

 if parts:
 if len(parts\[0\]) == 2 and parts\[0\].isalpha():
 territory = parts.pop(0).upper()
 elif len(parts\[0\]) == 3 and parts\[0\].isdigit():
 territory = parts.pop(0)

 if parts and (
 len(parts\[0\]) == 4
 and parts\[0\]\[0\].isdigit()
 or len(parts\[0\]) >= 5
 and parts\[0\]\[0\].isalpha()
 ):
 variant = parts.pop().upper()

 if parts:
 raise ValueError(f"{identifier!r} is not a valid locale identifier")

 # TODO(3.0): always return a 5-tuple
 if modifier:
 return lang, territory, script, variant, modifier
 else:
 return lang, territory, script, variant

def get\_locale\_identifier(
 tup: tuple\[str\]
 \| tuple\[str, str \| None\]
 \| tuple\[str, str \| None, str \| None\]
 \| tuple\[str, str \| None, str \| None, str \| None\]
 \| tuple\[str, str \| None, str \| None, str \| None, str \| None\],
 sep: str = "\_",
) -\> str:
 """The reverse of :func:\`parse\_locale\`. It creates a locale identifier out
 of a \`\`(language, territory, script, variant, modifier)\`\` tuple. Items can be set to
 \`\`None\`\` and trailing \`\`None\`\`\\\s can also be left out of the tuple.

 >>\> get\_locale\_identifier(('de', 'DE', None, '1999', 'custom'))
 'de\_DE\_1999@custom'
 >>\> get\_locale\_identifier(('fi', None, None, None, 'custom'))
 'fi@custom'

 .. versionadded:: 1.0

 :param tup: the tuple as returned by :func:\`parse\_locale\`.
 :param sep: the separator for the identifier.
 """
 tup = tuple(tup\[:5\]) # type: ignore # length should be no more than 5
 lang, territory, script, variant, modifier = tup + (None,) \* (5 - len(tup))
 ret = sep.join(filter(None, (lang, script, territory, variant)))
 return f'{ret}@{modifier}' if modifier else ret

def get\_cldr\_version() -> str:
 """Return the Unicode CLDR version used by this Babel installation.

 Generally, you should be able to assume that the return value of this
 function is a string representing a version number, e.g. '47'.

 >>\> get\_cldr\_version()
 '47'

 .. versionadded:: 2.18

 :rtype: str
 """
 return str(get\_global("cldr")\["version"\])