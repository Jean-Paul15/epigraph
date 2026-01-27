# Dockerfile Neo4j avec GDS et APOC
FROM neo4j:5.15.0-enterprise

# Variables d'environnement pour les plugins
ENV NEO4J_ACCEPT_LICENSE_AGREEMENT=yes
ENV NEO4J_PLUGINS='["graph-data-science", "apoc"]'

# Configuration memoire optimisee
ENV NEO4J_dbms_memory_heap_initial__size=512m
ENV NEO4J_dbms_memory_heap_max__size=2G
ENV NEO4J_dbms_memory_pagecache_size=512m

# Permissions pour import CSV
ENV NEO4J_dbms_security_procedures_unrestricted=gds.*,apoc.*
ENV NEO4J_dbms_security_procedures_allowlist=gds.*,apoc.*

# Copier la configuration personnalisee
COPY conf/neo4j.conf /var/lib/neo4j/conf/neo4j.conf

# Copier les scripts d'initialisation
COPY scripts/ /scripts/
RUN chmod +x /scripts/init.sh

# Script wrapper pour demarrage + init
COPY docker-entrypoint-wrapper.sh /docker-entrypoint-wrapper.sh
RUN chmod +x /docker-entrypoint-wrapper.sh

# Exposer les ports
EXPOSE 7474 7687

# Utiliser le wrapper comme entrypoint
ENTRYPOINT ["/docker-entrypoint-wrapper.sh"]
CMD ["neo4j"]
