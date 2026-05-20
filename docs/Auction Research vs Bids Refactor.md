# **Refactor: Auction Research vs Bids**

**Purpose**
Currently the application utilizes one set of item records for both auction research and the live auction bidding.

This causes several issues:

- Management of records is difficult. Processes and and services are tasked with both broad record collection and management of highly focused bid records
- Record schemas are forced to accommodate fields that are only relevant to one context or the other
- Serviecs are forced to handel both broad collection and focused management. For example the scraper service is responsible for both initial record collection and subsequent "winning" price updates, management of winning bids, losing bids, lost vs won bids.
- The management of research related items and bid related items is convoluted and inefficient.
- These record sets serve two distinct purposes and as such should be managed as distinct systems

**Proposed Solution**
Split the application's record management into two distinct schemas and services:

1. **Auction Research Schemas / Tables**: For broad record collection and management, and analysis.
2. **Auction Bidding Schemas / Tables**: For focused bid record management and updates for active autctions specifically for the items that the user is actively bidding on. These will execute on a much more focused and aggressive schedule based on the users needs.
3. Services should be split into two distinct systems:
   1. **Auction Research Services**: For broad record collection and management
   2. **Auction Bidding Services**: For focused bid record management and price updates for active autctions specifically for the items that the user is actively bidding on. These will execute on a much more focused and aggressive schedule based on the users needs.

**Service and scraper rules**

1. All scrapers should output standardized and sanitized data and scrapers should exist for each data provider. Data transformation should be handled within the auction house scraper.
2. A distinct class should be responsbile for outputing research records.
3. A distinct class should be responsbile for outputing bid records
4. A distinct class should be responsbile for managing won/lost status and winning/outbid status.
5. All services should expect a standardized input and output standardized and sanitized data
6. Single responsibility should be the guiding principle

**Database and Schema Rules**
The current schema currently includes attriutes for both research and bidding. These should be split into the distinct research and bidding schemas/tables as mentioned above. - No relation between research and bidding schemas is required or recommended. These systems are entirely separate concerns.

**Data retention and migration**

1. The only data that currently exists in the database that should be retained are records that have were activley bid on. The remaining research data should be discarded and refreshed once the new refactored codebase is deployed.
