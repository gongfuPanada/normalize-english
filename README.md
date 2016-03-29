# normalize-english
Normalize and clean English for chat-like applications

## Installation

```sh
npm install normalize-english
```

## Usage

```
import {clean} from 'normalize-english'
clean('THAT IS TREW') //-> 'that is true'
```

Based on @silentrob's
[https://www.npmjs.com/package/node-normalizer](node-normalizer)
but with some key differences:
- Data is obtained using `require`, so there is no async load step
- No dependencies on the C++ "RE2" package, so it runs in the browser just fine
- normalize-english performs case normalization
- No `~` tokens are inserted - rather, normal english is inserted for replacements
