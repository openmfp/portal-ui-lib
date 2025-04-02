export const kcpCA =
  'LS0tLS1CRUdJTiBDRVJUSUZJQ0FURS0tLS0tCk1JSURCakNDQWU2Z0F3SUJBZ0lRTVpzZWRjTE5DOWEvWFR2ZmErT091REFOQmdrcWhraUc5dzBCQVFzRkFEQWQKTVJzd0dRWURWUVFERXhKdmNHVnViV1p3TFd0amNDMXdhMmt0WTJFd0hoY05NalV3TVRBNU1UYzBOVE01V2hjTgpNelV3TVRBM01UYzBOVE01V2pBZE1Sc3dHUVlEVlFRREV4SnZjR1Z1Yldad0xXdGpjQzF3YTJrdFkyRXdnZ0VpCk1BMEdDU3FHU0liM0RRRUJBUVVBQTRJQkR3QXdnZ0VLQW9JQkFRRGwrWHMrSFhrcDlRaWsxWXpWd3JhZlNUbU4KUm5aVXc0clVsTmYzTHZzM2F3Y05PN1hjZHRzZHZCRi84dmVBQlh4aDNhQWhwWDdwQ2FvanV0cmxHcGFzM1Z0bAoyamRseFE0eFY4ZS9ZNVNuZzVmY0d4NGtMWGZGT0xUK0QvKzgyVjZneWNNZkY3ZGtoVnNFSVB0dXZ0bktnakJPCkdla0o0SlpzT3I0cFNZdTU0b3FkVFpVWisrYVk3b2o0M0pxVUpTMjhZTVhTeWkwTGpjZXNjWWIxTTR3VVZmd1AKVkdmcUtVS1YrY3Z2enZ1TTZFd2VMTXJ2V3dLNmlycTYyaWdVMlRWZURJODRxVTN3R3UzTlVXaDJkUTNxSHBzbQpNTThydGE3Qnk3cWZkVXU3bHBaaHdXRXJIaGt4T3dnTk5VQ3c0ZFB5VzNjTHdaWmcrT3BZMEljN28raHJBZ01CCkFBR2pRakJBTUE0R0ExVWREd0VCL3dRRUF3SUNwREFQQmdOVkhSTUJBZjhFQlRBREFRSC9NQjBHQTFVZERnUVcKQkJUc2JvMndlTVBnd2cvR0ZkMzEvRGVkbHRHMmlUQU5CZ2txaGtpRzl3MEJBUXNGQUFPQ0FRRUFMZEpHTnFUZApncVFNc0xaRjBiZVRvTll5N1FFUFBaTmdDMzRhdzgvYTJQL3R4aVVVR0lXMVkweWVmQmc1WlJTUzRzTXllUTZrCmNMYXJEaFlFckpoMmZ5NTNPVHlSVk5YdW5oSHN4TDdoNE1mYjNpZFU1OGhDNURtdzEyRDQ1MFEwM2JiR3pNNlQKQ2JHQ2N1S1VEaDNGRkJYb3MvcUwvakQ2TE54OHFtQlkzT3V0T09BOGpDRjR2UXBFN1Erd283NlRrQTl6T3BlWQpGazhna3lac1JGcmJwditVbWFmVC9Ma2tKWUhQM0ZINjhpSXI2WEUyMmI2N0dTak9HamF1VDJ5ZUxZbDB3NFRxCjdobkRjakRrSllIRFpRYSs1MmhnYkhPVjRVcHhOQnZhcUhFZWphYUhFWkZKT0dMVUxJRzFWVTdGZFNPU0ZlZXoKYnl1VForSEtWdVlsTGc9PQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0t';

export const kubeConfigTemplate = `
    apiVersion: v1
    kind: Config
    clusters:
    - name: <cluster-name>
      cluster:
        certificate-authority-data: <ca-data>
        server: "https://kcp.api.portal.cc-one.showroom.apeirora.eu/clusters/<server-url>"
    contexts:
    - name: <cluster-name>
      context:
        cluster: <cluster-name>
        user: <cluster-name>
    current-context: <cluster-name>
    users:
    - name: <cluster-name>
      user:
        exec:
          apiVersion: client.authentication.k8s.io/v1beta1
          args:
          - oidc-login
          - get-token
          - --oidc-issuer-url=https://auth.portal.cc-one.showroom.apeirora.eu/realms/openmfp
          - --oidc-client-id=openmfp-public
          - --oidc-extra-scope=email
          - --oidc-extra-scope=groups
          command: kubectl
          env: null
          interactiveMode: IfAvailable
`;
