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
          - --oidc-issuer-url=https://portal.cc-one.showroom.apeirora.eu/keycloak/realms/openmfp
          - --oidc-client-id=openmfp-public
          - --oidc-extra-scope=email
          - --oidc-extra-scope=groups
          command: kubectl
          env: null
          interactiveMode: IfAvailable
`;
