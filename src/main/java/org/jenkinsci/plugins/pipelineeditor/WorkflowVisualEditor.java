package org.jenkinsci.plugins.pipelineeditor;

import hudson.Extension;
import org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition;
import org.kohsuke.stapler.DataBoundConstructor;

/**
 * @author Kohsuke Kawaguchi
 */
public class WorkflowVisualEditor extends CpsFlowDefinition {
    /**
     * JSON data model that the front end uses.
     */
    private final String json;

    @DataBoundConstructor
    public WorkflowVisualEditor(String script, String json) {
        super(script);
        this.json = json;
    }

    public String getJson() {
        return json;
    }

    @Extension
    public static class DescriptorImpl extends CpsFlowDefinition.DescriptorImpl {
        @Override
        public String getDisplayName() {
            return "Pipeline Visual Editor";
        }
    }
}
