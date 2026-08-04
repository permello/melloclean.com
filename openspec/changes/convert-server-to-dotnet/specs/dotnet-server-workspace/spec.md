## Purpose

Defines how the .NET server remains a first-class participant in the repository's unified developer,
build, validation, and test commands despite not being an npm application.

## ADDED Requirements

### Requirement: Root workflows include the .NET server
The repository SHALL retain root npm commands for development, build, test, type checking, and linting
or formatting that invoke the corresponding validation for the .NET server as well as the JavaScript
workspaces. A successful root command SHALL mean its server operation also succeeded.

#### Scenario: Root build includes server compilation
- **WHEN** a developer runs `npm run build`
- **THEN** the .NET server is restored and compiled along with the client, dashboard, and shared packages

#### Scenario: Root test includes server tests
- **WHEN** a developer runs `npm test`
- **THEN** the .NET server test suite runs along with all configured JavaScript test suites

#### Scenario: Root validation detects C# failures
- **WHEN** server compilation, tests, or configured static validation fails during its corresponding root command
- **THEN** that root command exits unsuccessfully

### Requirement: Server has direct .NET workflows
The server SHALL support direct restore, build, test, and development commands using standard .NET
tooling without requiring its runtime or dependencies to be installed through npm.

#### Scenario: Running server tests directly
- **WHEN** a developer invokes the documented .NET test command for the server
- **THEN** only the server test projects execute

#### Scenario: Running the server locally
- **WHEN** a developer invokes the documented .NET development command
- **THEN** the server listens on port 5000 and reloads after C# source changes

